import { db } from '../../util';
import { Collections } from '../../constants';

import { addProposal } from './addProposal';
import { getProposal } from './getProposal';
import { getProposals } from './getProposals';
import { updateProposal } from './updateProposal';
import { getFundingRequest } from './getFundingRequest';
import { getJoinRequest } from './getJoinRequest';
import { IProposalEntity } from '../proposalTypes';

import { addVote } from './votes/addVote';
import { getVote } from './votes/getVote';
import { getAllProposalVotes } from './votes/getAllProposalVotes';
import { IVoteEntity } from '../voteTypes';

export const votesCollection = db.collection(Collections.Votes)
  .withConverter<IVoteEntity>({
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IVoteEntity {
      return snapshot.data() as IVoteEntity;
    },
    toFirestore(object: IVoteEntity | Partial<IVoteEntity>): FirebaseFirestore.DocumentData {
      return object;
    }
  });

export const proposalsCollection = db.collection(Collections.Proposals)
  .withConverter<IProposalEntity>({
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IProposalEntity {
      return snapshot.data() as IProposalEntity;
    },
    toFirestore(object: IProposalEntity | Partial<IProposalEntity>): FirebaseFirestore.DocumentData {
      return object;
    }

  });

export const proposalDb = {
  addProposal,
  getProposal,
  getFundingRequest,
  getJoinRequest,
  getProposals,
  update: updateProposal
};

export const voteDb = {
  addVote,
  getVote,
  getAllProposalVotes
};