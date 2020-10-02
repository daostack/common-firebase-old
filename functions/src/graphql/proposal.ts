import BN from 'bn.js';
import moment from 'moment';
import express from 'express';
import admin from 'firebase-admin';
import promiseRetry from 'promise-retry';
import { Vote } from '@daostack/arc.js';

import { Utils } from '@util/util';
import { ProposalCollection } from '@util';
import { updateProposal } from '@db/proposalDbService';
import { findUserByAddress } from '@db/userDbService';
import { getArc, ipfsDataVersion, retryOptions } from '@settings';
import { CommonError, UnsupportedVersionError } from '../util/errors';

const db = admin.firestore();

const parseVotes = (votesArr) => {
    return votesArr.map(({ coreState: { voter, outcome } }) => { return { voter, outcome } })
}

const _updateProposalDb = async (proposal) => {
    const arc = await getArc();
    const result = { updatedDoc: null, errorMsg: null };
    const s = proposal.coreState

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const votes = await Vote.search(arc, { where: { proposal: s.id } }, { fetchPolicy: 'no-cache' }).first();

    // TODO: for optimization, consider looking for a new member not as part of this update process
    // but as a separate cloudfunction instead (that watches for changes in the database and keeps it consistent)

    // try to find the memberId corresponding to this address
    const proposer = await findUserByAddress(s.proposer)
    const proposerId = proposer && proposer.id
    let proposedMemberId
    if (!s.proposedMember) {
        proposedMemberId = null
    } else if (s.proposer === s.proposedMember) {
        proposedMemberId = proposerId
    } else {
        const proposedMember = await findUserByAddress(s.proposedMember)
        proposedMemberId = proposedMember.id
    }

    // TO-BE-REMOVED: That should be deleted once we reset the data again.
    // It's needed because right now we have description property of type string which could be a jsoon or just a description of a proposal.
    let proposalDescription = null;
    try {
        proposalDescription = JSON.parse(s.description);
    } catch (error) {
        proposalDescription = {
            description: s.description,
            title: s.title
        };
    }

    const proposalDataVersion = proposalDescription.VERSION;

    if (proposalDataVersion < ipfsDataVersion) {
        throw new UnsupportedVersionError(`Skipping this proposal ${s.id} as it has an unsupported version ${proposalDataVersion} (should be >= ${ipfsDataVersion})`);
    }

    const thousand = new BN(1000);
    // @refactor
    const doc = {
        boostedAt: s.boostedAt,
        description: proposalDescription,
        closingAt: s.closingAt,
        createdAt: s.createdAt,
        dao: s.dao.id,
        executionState: s.executionState,
        executed: s.executed,
        executedAt: s.executedAt,
        expiresInQueueAt: s.expiresInQueueAt,
        votesFor: s.votesFor.div(thousand).toString(),
        votesAgainst: s.votesAgainst.div(thousand).toString(),
        id: s.id,
        name: s.name,
        preBoostedAt: s.preBoostedAt,
        proposer: s.proposer,
        proposerId,
        resolvedAt: s.resolvedAt,
        stage: s.stage,
        stageStr: s.stage.toString(),
        type: s.type,
        join: {
            proposedMemberAddress: s.proposedMember || null,
            proposedMemberId: proposedMemberId,
            funding: s.funding && s.funding.toString() || null,
            reputationMinted: s.reputationMinted && s.reputationMinted.toString() || null
        },
        fundingRequest: {
            beneficiary: s.beneficiary || null,
            proposedMemberId: proposedMemberId,
            amount: s.amount && s.amount.toString() || null,
            amountRedemeed: s.amountRedeemd && s.amountRedeemed.toString() || null,
        },
        votes: votes.length > 0 ? parseVotes(votes) : [],
        winningOutcome: s.winningOutcome,
    }

    //await db.collection('proposals').doc(s.id).set(doc, { merge: true })
    await updateProposal(s.id, doc);
    result.updatedDoc = doc;

    return result;
}

export const  updateProposalById = async (proposalId, customRetryOptions = {}, blockNumber) => {
    const arc = await getArc();
    let currBlockNumber = null;
    if (blockNumber) {
        currBlockNumber = Number(blockNumber);
        if (Number.isNaN(currBlockNumber)) {
            throw new CommonError(`The blockNumber parameter should be a number between 0 and ${Number.MAX_SAFE_INTEGER}`);
        }
    }

    const proposal = await promiseRetry(
        async (retryFunc, number) => {
            console.log(`Try #${number} to get Proposal ${proposalId}`);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const proposals = await arc.proposals({ where: { id: proposalId } }, { fetchPolicy: 'no-cache' }).first()

            let isBehindLatestBlock = true; // set initially to true and change only if the blockNumber is provided and checked
            if (currBlockNumber) {
                const latestBlockNumber = await Utils.getGraphLatestBlockNumber();
                isBehindLatestBlock = currBlockNumber <= latestBlockNumber;
            }

            if (proposals.length === 0) {
                await retryFunc(`We could not find a proposal with id "${proposalId}" in the graph.`);
            } else if (!isBehindLatestBlock) {
                await retryFunc(`We could not find an update for block "${blockNumber}" in the graph.`);
            }

            return proposals[0]
        },
        { ...retryOptions, ...customRetryOptions }
    );

    const updatedDoc = await _updateProposalDb(proposal);

    console.log("updated proposal", proposal.id);
    return updatedDoc;
}

export const  updateProposals = async () =>  {
    const arc = await getArc();
    const allProposals = [];
    let currProposals = null;
    let skip = 0;
    
    do {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        currProposals = await arc.proposals({ first: 1000, skip: skip * 1000 }, { fetchPolicy: 'no-cache' }).first();
        allProposals.push(...currProposals);
        skip++;
    } while (currProposals && currProposals.length > 0);
    
    console.log(`found ${allProposals.length} proposals`)

    const updatedProposals = [];
    const skippedProposals = [];

    await Promise.all(allProposals.map(async proposal => {
        try {
            updatedProposals.push(await _updateProposalDb(proposal));
        } catch (e) {
            if (e.code === 1 || e instanceof UnsupportedVersionError) {
                console.log(`Skipped ${proposal.id} due to old data version.`);

                skippedProposals.push({
                    proposalId: proposal.id,
                    skippedDueTo: e.message
                });
            } else {
                throw e;
            }
        }
    }));
        
    return {
        updatedProposals,
        skippedProposals
    };
}

export type ProposalState = 'Approved' | 'Rejected'  | 'New' | 'Countdown';

const ProposalStage = {
    ExpiredInQueue: 0,
    Executed: 1,
    Queued: 2,
    PreBoosted: 3,
    Boosted: 4,
    QuietEndingPeriod: 5,
};

export const LaunchedStated = [
    ProposalStage.Queued,
    ProposalStage.PreBoosted,
];

export const CountdownStates = [
    ProposalStage.Boosted,
    ProposalStage.QuietEndingPeriod,
];

export const getProposalState = async (req: express.Request): Promise<ProposalState> => {
    const { proposalId} = req.query;

    const proposal = (await db.collection(ProposalCollection).doc(proposalId as string).get()).data();

    if (!proposal) {
        throw new CommonError (
          `Cannot find proposal with id ${proposalId}`,
          'Cannot find the requested proposal',
          404
        )
    }

    if(proposal.stage === ProposalStage.Executed) {
        return proposal.winningOutcome === 1
            ? 'Approved'
            : 'Rejected';
    }

    if(
      proposal.stage === ProposalStage.ExpiredInQueue ||
      moment().isAfter(moment.unix(proposal.closingAt))
    ) {
        return 'Rejected';
    }

    if(LaunchedStated.includes(proposal.stage)) {
        return 'New'
    }

    if(CountdownStates.includes(proposal.stage)) {
        return 'Countdown';
    }

    console.error('Proposal state not caught', new CommonError(`Cannot determine proposal state (${JSON.stringify(proposal)})`))

    return 'Rejected';
};
