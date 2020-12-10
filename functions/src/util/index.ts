import admin from 'firebase-admin';

export const db = admin.firestore();

// ---- Reexports
export { externalRequestExecutor } from './externalRequestExecutor';
export { commonApp, commonRouter } from './commonApp';
export { addMonth } from './addMonth';
export { logger } from './logger';
export { sleep } from './sleep';
export { poll } from './poll';
