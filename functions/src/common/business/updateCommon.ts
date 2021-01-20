import * as yup from 'yup';

import { commonDb } from '../database';
import { ICommonUpdate, ICommonEntity } from '../types';
import { createEvent } from '../../util/db/eventDbService';
import { EVENT_TYPES } from '../../event/event';
import { commonEditHistoryDb } from '../../commonEditHistory/database';
import { linkValidationSchema, commonRuleValidationSchema } from '../../util/schemas';

const updateCommonDataValidationScheme = yup.object({
commonId: yup
.string()
.required(),  newCommon: yup.object({
    name: yup.string().required(),//
    rules: yup.array(commonRuleValidationSchema).optional(),//
    updatedAt: yup.string().required(), //
    members: yup.array().required(),//
    metadata: yup.object({
      action: yup.string(),
      byline: yup.string().required(),//
      contributionType: yup
        .string()
        .oneOf(['one-time', 'monthly'])
        .default('one-time')
        .required().required(),
      description: yup.string().required(),
      founderId: yup.string().required(),
      minFeeToJoin: yup.number().required(),
    }).required(),
    balance: yup.number().required(),//
    raised: yup.number().required(), //
    image: yup.string().url().required(),//
    register: yup
      .string()
      .oneOf(['na', 'registered'])
      .default('na')
      .required(),//
    links: yup.array(linkValidationSchema).optional(),//
    createdAt: yup.string().required(),//   
    fundingGoalDeadline: yup.number().required(), //
  }).required(),
  changedBy: yup.string().required(),
})

type UpdateCommonPayload = yup.InferType<typeof updateCommonDataValidationScheme>

/**
 * Updating the common with the new data in commonUpdate
 * @param commonUpdate       - info of the common that needs to be updated
 * @return updatedCommon     - the common doc after the update
 */
export const updateCommon = async (commonUpdate: UpdateCommonPayload) : Promise<ICommonEntity> => {
  const common = await commonDb.get(commonUpdate.newCommon.id);

  console.log('========= commonUpdate struct: =========== ', commonUpdate)
  // the doc that was saved in the commonEditHistory collection
  const commonHistoryRecord = await commonEditHistoryDb.add(commonUpdate); 
  const updatedCommon = await commonDb.update(commonUpdate.newCommon)

  await createEvent({
    userId: commonHistoryRecord.changedBy,
    objectId: commonHistoryRecord.commonId,
    type: EVENT_TYPES.COMMON_UPDATED
  })

  return updatedCommon;
}