import { ArgumentError } from '../../util/errors';
import { Nullable } from '../../util/types';
import { IDiscussionEntity } from '../types';
import { IProposalEntity } from '../../proposals/proposalTypes';
//import { NotFoundError } from '../../util/errors';

import { discussionCollection } from './index';

// discussion can be an Discussion doc or a discussion from a Proposal doc
export const getDiscussion = async (discussionId: string) : Promise<any> => {
    if(!discussionId) {
    throw new ArgumentError('discussionId', discussionId);
  }

  const discussion = (await discussionCollection
    .doc(discussionId)
    .get()).data() as Nullable<IDiscussionEntity | IProposalEntity>

  // @consultAlex in the morning
  /*if (!discussion) {
    throw new NotFoundError(discussionId, 'discussion');
  }*/

  return discussion;

}
