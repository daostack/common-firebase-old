const functions = require('firebase-functions');
const app = require('express')();

const { testEmailSending } = require('./testEmailSending');

const runtimeOptions = {
  timeoutSeconds: 540
};

app.get('/test/sending', async (req, res) => {
  try {
    const res = await testEmailSending(req);

    res.status(200).send({
      message: 'Email processed successfully.',
      data: {
        response: res
      }
    })
  } catch(e) {
    res.status(500).send({
      message: 'An error occurred while trying to send the email',
      error: e.message,
    });
  }
});

exports.tests = functions
  .runWith(runtimeOptions)
  .https.onRequest(app);