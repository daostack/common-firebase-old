import admin from 'firebase-admin';
import Timestamp = admin.firestore.Timestamp;

export const db = admin.firestore();

// ---- Reexports
export { externalRequestExecutor } from './externalRequestExecutor';
export { commonApp, commonRouter } from './commonApp';

// -- Lonely helpers
export const addMonth = (date: Date | Timestamp): Date => {
  if(!(date instanceof Date)) {
    date = date.toDate();
  }

  if (date) {
    const d = (date = new Date(Number(date))).getDate();

    date.setMonth(date.getMonth() + 1, 1);
    const m = date.getMonth();

    date.setDate(d);

    if (date.getMonth() !== m)
      date.setDate(0);
  }

  return date;
};
