const app = require('express')();
const functions = require('firebase-functions');

const {
  testEmailSending,
  testDaoCreationEmails,
  testPreauthFailedEmails
  // testEmailProposalsEmails
} = require('./testEmailSending');

const runtimeOptions = {
  timeoutSeconds: 540
};

const processReq = async (req, res, func) => {
  try {
    const result = await func();

    res.status(200).send({
      message: 'Email processed successfully.',
      data: {
        response: result
      }
    });
  } catch (e) {
    res.status(500).send({
      message: 'An error occurred while trying to send the email',
      error: e.message
    });
  }
};


app.get('/sendEmail', async (req, res) => {
  await processReq(req, res, async () => {
    return await testEmailSending(req);
  });
});

app.get('/sendNewDaoEmails', async (req, res) => {
  await processReq(req, res, async () => {
    return await testDaoCreationEmails(req);
  });
});

app.get('/sendPreauthFailedEmails', async (req, res) => {
  await processReq(req, res, async () => {
    return await testPreauthFailedEmails(req);
  });
});

// app.get('/sendMakeProposalsEmails', async (req, res) => {
//   await processReq(req, res, async () => {
//     return await testEmailProposalsEmails(req);
//   })
// });

app.get('/backup', async (req, res) => {
  const firestore = require('@google-cloud/firestore');
  const dateformat = require('dateformat');

  const client = new firestore.v1.FirestoreAdminClient();

  console.info('🚀 Beginning backup procedure');

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = client.databasePath(projectId, '(default)');

  const timestamp = dateformat(Date.now(), 'isoDateTime')
  const bucket =
    process.env.GCLOUD_PROJECT === 'common-staging-50741'
      ? `gs://common-staging-50741.appspot.com/backup/${timestamp}` :
    projectId.env.GCLOUD_PROJECT === 'common-daostack'
      && `gs://common-daostack.appspot.com/backup/${timestamp}`;

  if(!bucket) {
    throw new Error('Environment Error: cannot find the current GCloud project!');
  }

  const result = await client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    collectionIds: []
  });

  console.info('✨ Backup procedure done successfully');

  // res.send("result");
});

exports.tests = functions
  .runWith(runtimeOptions)
  .https.onRequest(app);



