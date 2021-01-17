import admin from 'firebase-admin';
import { ICommonEntity } from '../common/types';
import Timestamp = admin.firestore.Timestamp;

export interface ICommonEditHistory {
	changedAt: Timestamp,
	commonId: string,
	changedBy: string,
	originalDocument: ICommonEntity,
	newDocument: ICommonEntity,
}