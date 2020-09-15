const functions = require('firebase-functions');
const { findUserById } = require('../db/userDbService');

export interface INotification {
    userId: string,
    objectId: string,
    type: string,
    createdAt: string,
}

export enum NOTIFICATION_TYPES {
    //CREATION notifications
    CREATION_COMMON = 'creationCommon',
    CREATION_PROPOSAL = 'creationProposal',
    CREATION_REQUEST_TO_JOIN = 'creationReqToJoin',
    //APPROVED notifications
    APPROVED_REQUEST_TO_JOIN = 'approvedReqToJoin',
    APPROVED_PROPOSAL = 'approvedProposal',
    //REJECTED notifications
    REJECTED_REQUEST_TO_JOIN = 'approvedReqToJoin',
    REJECTED_PROPOSAL = 'rejectedProposal',
}

// const { userInfoTrigger, sendFollowerNotification } = require('./follow');
const { commonCreation, commonCreationNotification } = require('./commonCreation');

// exports.userInfoTrigger = userInfoTrigger;
// exports.sendFollowerNotification = sendFollowerNotification;
exports.commonCreation = commonCreation;

//const commonCreationNotification = functions.firestore.document('/notification/commonCreation/{userId}/{commonId}')
functions.firestore.document('/notification').onCreate(async (snapshot) => {
    return processNotificationEvent(snapshot)
});

const processNotificationEvent = async (notification: INotification) => {
    const tokenRef = findUserById(notification.userId);
    const tokens = await tokenRef.get().then(doc => { return doc.data().tokens });

    switch (notification.type) {
        case NOTIFICATION_TYPES.CREATION_COMMON:
            return commonCreationNotification(notification, tokens);
        case NOTIFICATION_TYPES.CREATION_PROPOSAL:
            return commonCreationNotification(notification, tokens);
        case NOTIFICATION_TYPES.CREATION_REQUEST_TO_JOIN:
            return commonCreationNotification(notification, tokens);
        default:
            return null;
    }
}