import { firestore } from 'firebase-admin';
import { v4 } from 'uuid';
import { commonEditHistoryDb } from '../database';
import { ICommonEditHistory } from '../types';

export const createCommonHistory = async (payload, originalCommon): Promise<ICommonEditHistory> => {
	const {changes, userId} = payload;

  const commonHistoryRecord: ICommonEditHistory = {
      id: v4(),
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      commonId: originalCommon.id,
      changedBy: userId,
      originalDocument: originalCommon,
      newDocument: changes
  }
  
  commonEditHistoryDb.add(originalCommon.id, commonHistoryRecord); // adding history
  return commonHistoryRecord;

}
