import admin from 'firebase-admin';

import { Collections } from '../util/constants';
import { IEventEntity } from '../util/types';

const db = admin.firestore();


export const createEvent = async (event: Omit<IEventEntity, 'id'>): Promise<any> => {
  return await db.collection(Collections.Event).add(event);
};