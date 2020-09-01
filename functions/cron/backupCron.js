const shell = require('shelljs');
const functions = require('firebase-functions');

const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

exports.backup = functions.pubsub
  .schedule('0 */3 * * *')
  .onRun(async (context) => {
    console.info('🚀 Beginning backup procedure');

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    const bucket = `gs://common-daostack.appspot.com/backup/${context.timestamp}`;

    await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      collectionIds: []
    });

    console.info('✨ Backup procedure done successfully');
  });