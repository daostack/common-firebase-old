const emailClient = require('./index');
const { env } = require('@env');

exports.sendCommonCreatenFailedEmail = async (commonData) => {
    
    console.debug(`Sending admin email for WalletCreationFailed to ${env.mail.adminMail}`);

    await emailClient.sendTemplatedEmail({
        to: env.mail.adminMail,
        templateKey: 'adminWalletCreationFailed',
        emailStubs: {
            commonName: commonData.name,
            commonId: commonData.id
        }
    });

    console.debug('Done sending emails for dao creation');
};

