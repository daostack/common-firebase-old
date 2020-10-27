import { QueryDocumentSnapshot } from '@google-cloud/firestore';

import { db } from '../settings';
import { Collections } from '../util/constants';

import { IEventModel } from './index';
import { EVENT_TYPES } from './event';

export const totalRaisedTriggerHandler = async (doc: QueryDocumentSnapshot<IEventModel>): Promise<void> => {
  const data = doc.data();

  if(data.type === EVENT_TYPES.APPROVED_REQUEST_TO_JOIN) {
    const proposal = (await db.collection(Collections.Proposals)
      .doc(data.objectId)
      .get())
    .data();

    const common = (await db.collection(Collections.Commons)
      .doc(proposal.dao)
      .get())
    .data();

    await db.collection(Collections.Commons)
      .doc(proposal.dao)
      .set({
        metadata: {
          totalRaised: (common.metadata.totalRaised || 0) + proposal.description.fundung
        }
      });
  }
};