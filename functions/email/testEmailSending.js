const { sendMailAsync } = require('../mailer');

const testEmailSending = async (req) => {
  const { email, subject, message } = req.query;

  if(!email) {
    throw new Error("Email is not provided!");
  }

  await sendMailAsync(
    email,
    subject || "Test email",
    message || "This is test email for testing the email sending capabilities of the application."
  );

  return "Email send successfully!";
};

module.exports = { testEmailSending };