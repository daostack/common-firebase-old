import { firestore } from 'firebase-admin';

import { ICommonEntity } from '../types';
import { commonCollection } from './index';

export type IUpdatableCommonEntity = Partial<ICommonEntity> & {
  id: string;
}

/**
 * Updates the common in the backing store
 *
 * @param common - The updated common
 */
export const updateCommon = async (common: IUpdatableCommonEntity): Promise<IUpdatableCommonEntity> => {
  const commonEntity: IUpdatableCommonEntity = {
    ...common,

    updatedAt: firestore.Timestamp.now()
  };

  await commonCollection
    .doc(commonEntity.id)
    .update(commonEntity);

  return commonEntity;
}