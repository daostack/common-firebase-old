import { INotification, NOTIFICATION_TYPES } from ".";
import { createNotification } from '../db/notificationDbService'

const functions = require('firebase-functions');
const Notification = require('./notification');
const admin = require('firebase-admin');

const commonCreation = functions.firestore.document('/daos/{daoId}')
  .onCreate(async (snapshot, context) => {
    createNotification
    return admin.firestore().doc(`notification`).set({
      userId: snapshot.data().members[0].userId,
      objectId: context.params.daoId,
      createdAt: new Date(),
      type: NOTIFICATION_TYPES.CREATION_COMMON
    })
  });

const commonCreationNotification = async (notification: INotification, tokens: [string]) => {

  const commonRef = await admin.firestore().collection('daos').doc(`${notification.objectId}`)
  const common = await commonRef.get().then(doc => { return doc.data() })

  let title = 'Your common was created 🎉';
  let body = `${common.name} is available on common list.`
  let image = common.metadata.avatar || '';

  return Notification.send(tokens, title, body, image);
}

module.exports = { commonCreation, commonCreationNotification };
