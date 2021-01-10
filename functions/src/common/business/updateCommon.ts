
import { commonDb } from '../database';
import { ICommonEntity, ICommonUpdate } from '../types';
import { createEvent } from '../../util/db/eventDbService';
import { EVENT_TYPES } from '../../event/event';

export const updateCommon = async (commonUpdate: ICommonUpdate) : Promise<ICommonEntity> => {
  // should we validate here like in createCommon?
  // check if user is owner of common
  
  const updatedCommon = await commonDb.update(commonUpdate.common);

  // but we need to save more data:
  // we have
  // - ownerId who initiaed the change,
  // - changed common id
  // we need to store changes (commonUpdate.commonChanges)
  await createEvent({
    userId: commonUpdate.userId,
    objectId: commonUpdate.common.id,
    type: EVENT_TYPES.COMMON_UPDATED
  })

  return updatedCommon;
}