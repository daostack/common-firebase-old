const functions = require('firebase-functions');
const app = require('express')();

const { testEmailSending } = require('./testEmailSending');

const runtimeOptions = {
  timeoutSeconds: 540
};

app.get('/test/email', async (req, res) => {
  try {
    res.send(await testEmailSending(req));
  } catch(e) {
    res.send('An error occurred while trying to send the test email. Please consult the logs for more information')
  }
});

exports.tests = functions
  .runWith(runtimeOptions)
  .https.onRequest(app);