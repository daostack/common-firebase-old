import * as yup from 'yup';

import { CommonError } from '../../util/errors';
import { commonDb } from '../database';
import { createCommonHistory } from '../../commonEditHistory/business';
import { ICommonEntity } from '../types';
import { createEvent } from '../../util/db/eventDbService';
import { EVENT_TYPES } from '../../event/event';
import { commonRuleValidationSchema } from '../../util/schemas';

const updateCommonDataValidationScheme = yup.object({
  commonId: yup
    .string()
    .required(),  

  userId: yup.string()
    .required(),

  changes: yup.object({
    name: yup.string().required(),
    rules: yup.array(commonRuleValidationSchema).optional(),
    
    metadata: yup.object({
      byline: yup.string(),
      description: yup.string(),
    }),
    image: yup.string().url().required(),
  }).required(),
 
})

type UpdateCommonPayload = yup.InferType<typeof updateCommonDataValidationScheme>

/**
 * Updating the common with the new data in commonUpdate
 * @param commonUpdate       - info of the common that needs to be updated
 * @return updatedCommon     - the common doc after the update
 */
export const updateCommon = async (payload/*: UpdateCommonPayload*/) : Promise<ICommonEntity> => {
  const currCommon = await commonDb.get(payload.commonId);
  // when we have permission, this will be a different check
  if (currCommon.metadata.founderId !== payload.userId) {
    throw new CommonError('Try again when you created the common')
  }

  // the doc that was saved in the commonEditHistory collection
  const commonHistoryRecord = await createCommonHistory(payload, currCommon);
  const updatedCommon = await commonDb.update(payload.changes)

  await createEvent({
    userId: commonHistoryRecord.changedBy,
    objectId: commonHistoryRecord.commonId,
    type: EVENT_TYPES.COMMON_UPDATED
  })

  return updatedCommon;
}