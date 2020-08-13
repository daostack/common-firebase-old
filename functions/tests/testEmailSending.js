const db = require('firebase-admin').firestore();
const emailClient = require('../email');
const util = require('../util/util');

const {getTemplatedEmail} = require('../email');
const {sendMail} = require('../mailer');

const testEmailSending = async (req) => {
  const {to, subject, message, template} = req.query;

  if (!to) {
    throw new Error("Email is not provided!");
  }

  if (!template) {
    await sendMail(
      to,
      subject || "Test email",
      message || "This is test email for testing the email sending capabilities of the application."
    );

    return "Email sent successfully!";
  }

  const templatedEmail = getTemplatedEmail('requestToJoinSubmitted', {
    emailStubs: {
      name: "Test Email",
      commonName: "New",
      link: "https://www.google.com/?client=safari",
      // supportChatLink: "https://www.google.com/?client=safari"
    }
  })

  await sendMail(
    to,
    templatedEmail.subject,
    templatedEmail.template
  );

  return "Templated email sent successfully!";
};

const testDaoCreationEmails = async (req) => {
  const { to } = req.query;

  const newDao = (await db.collection('daos').doc("0x1d169610875b37d39ea71868b75b6160146a2c9d").get()).data();
  const userId = newDao.members[0].userId;
  const userData = await util.getUserById(userId);
  const daoName = newDao.name;

  const commonLink = `https://app.common.io/common/${newDao.id}`;

  await Promise.all([
    emailClient.sendTemplatedEmail({
      to,
      templateKey: "userCommonCreated",
      emailStubs: {
        commonLink,
        name: userData.displayName,
        commonName: daoName,
      }
    }),

    emailClient.sendTemplatedEmail({
      to,
      templateKey: "adminCommonCreated",
      emailStubs: {
        userId,
        commonLink,
        userName: userData.displayName,
        userEmail: userData.email,
        commonCreatedOn: new Date().toDateString(),
        log: 'Successfully created common',
        commonId: newDao.id,
        commonName: newDao.name,
        description: newDao.metadata.description,
        about: newDao.metadata.byline,
        paymentType: 'one-time',
        minContribution: newDao.minFeeToJoin
      }
    }),

    await emailClient.sendTemplatedEmail({
      to,
      templateKey: 'adminWalletCreationFailed',
      emailStubs: {
        commonName: daoName,
        commonId: newDao.id
      }
    })
  ]);
}

module.exports = {
  testEmailSending,
  testDaoCreationEmails
};
