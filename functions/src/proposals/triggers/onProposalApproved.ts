import * as functions from 'firebase-functions';
import { Collections } from '../../constants';
import { IEventEntity } from '../../event/type';
import { EVENT_TYPES } from '../../event/event';
import { proposalDb } from '../database';
import { addCommonMemberByProposalId } from '../../common/business/addCommonMember';
import { fundProposal } from '../business/fundProposal';
import { createPayment } from '../../circlepay/createPayment';
import { CommonError } from '../../util/errors';


export const onProposalApproved = functions.firestore
  .document(`/${Collections.Event}/{id}`)
  .onCreate(async (eventSnap) => {
      const event = eventSnap.data() as IEventEntity;

      if (event.type === EVENT_TYPES.APPROVED_FUNDING_REQUEST) {
        console.info('Funding request was approved. Crunching some numbers');

        await fundProposal(event.objectId);
      }

      if (event.type === EVENT_TYPES.REQUEST_TO_JOIN_ACCEPTED) {
        console.info('Join request was approved. Adding new members to common');

        // @todo Create payment
        const proposal = await proposalDb.getProposal(event.objectId);

        if (proposal.type !== 'join') {
          throw new CommonError(`Cannot process approved request to join with id ${event.objectId}`);
        }

        await createPayment({
          ipAddress: '127.0.0.1',
          proposalId: proposal.id,
          proposerId: proposal.proposerId,
          funding: proposal.join.funding,
        });

        await addCommonMemberByProposalId(event.objectId);
      }
    }
  );