const sgMail = require('@sendgrid/mail');
const { env } = require('./env');
sgMail.setApiKey(env.mail.SENDGRID_API_KEY);

exports.sendMail = (dest, subject, message) => {
  const msg = {
    to: dest,
    from: env.mail.sender, // it strange  it's required because in the sendGrid configuration it's already specified
    subject: subject,
    text: message,
    html: message,
  };
  sgMail.send(msg);
};

exports.sendMailAsync = async (dest, subject, message) => {
  await sgMail.send({
    to: dest,
    from: env.mail.sender,
    subject: subject,
    text: message,
    html: message
  })
}


exports.MAIL_SUBJECTS = {
PREAUTH_FAIL: 'Failed preauthorization' 
};

