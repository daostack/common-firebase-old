  import * as functions from 'firebase-functions';
  import { Collections } from '../../constants';
  import { IJoinRequestProposal } from '../proposalTypes';
  import { createEvent } from '../../util/db/eventDbService';
  import { EVENT_TYPES } from '../../event/event';
  import { commonDb } from '../../common/database';
  import { addCommonMemberByProposalId } from '../../common/business/addCommonMember';

  export const onRequestToJoinExecuted = functions.firestore
    .document(`/${Collections.Proposals}/{id}`)
    .onUpdate(async (proposalSnap) => {
      const proposal = proposalSnap.after.data() as IJoinRequestProposal;

      if (proposal.paymentState === 'confirmed') {
        logger.info('Payment was successful. Adding new members to common');
        
        // notify user she's now a member
        await createEvent({
          type: EVENT_TYPES.REQUEST_TO_JOIN_EXECUTED,
          userId: proposal.proposerId,
          objectId: proposal.id
        });

        // Update common funding info
        const common = await commonDb.getCommon(proposal.commonId);

        common.raised += proposal.join.funding;
        common.balance += proposal.join.funding;

        await commonDb.updateCommon(common);

        // Add the user as member
        await addCommonMemberByProposalId(proposal.id);
      }
    }
  );