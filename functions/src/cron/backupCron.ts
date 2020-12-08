import * as functions from 'firebase-functions';

import { backup } from '../util/backup';

export const backupCron = functions.pubsub
  .schedule('0 */3 * * *')
  .onRun(async () => {
    console.time('Backup');
    console.info('🚀 Beginning backup procedure');

    await backup();

    console.info('✨ Backup procedure done successfully');
    console.timeEnd('Backup');
  });
