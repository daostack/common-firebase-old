const emailClient = require('./index');
const { env } = require('@env');
const { Utils } = require('../util/util');

exports.sendCommonCreatenSuccessEmail = async (userData, commonData ) => {
    
    const userId = userData.uid;
    const commonLink = Utils.getCommonLink(commonData.id);

    await Promise.all([
        emailClient.sendTemplatedEmail({
            to: userData.email,
            templateKey: 'userCommonCreated',
            emailStubs: {
                commonLink,
                name: userData.displayName,
                commonName: commonData.name
            }
        }),

        emailClient.sendTemplatedEmail({
            to: env.mail.adminMail,
            templateKey: 'adminCommonCreated',
            emailStubs: {
                userId,
                commonLink,
                userName: userData.displayName,
                userEmail: userData.email,
                commonCreatedOn: new Date().toDateString(),
                log: 'Successfully created common',
                commonId: commonData.id,
                commonName: commonData.name,
                description: commonData.metadata.description,
                about: commonData.metadata.byline,
                paymentType: 'one-time',
                minContribution: commonData.minFeeToJoin
            }
        })
    ]);
    console.debug('Done sending emails for dao creation');
};

