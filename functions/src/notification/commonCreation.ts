import { INotificationModel, NOTIFICATION_TYPES } from ".";
import { createNotification } from '../db/notificationDbService'

import * as functions from 'firebase-functions';
import Notification, { INotification } from './notification';
import admin from 'firebase-admin';

export const commonCreation = functions.firestore.document('/daos/{daoId}')
  .onCreate(async (snapshot, context) => {
    createNotification
    return admin.firestore().doc(`notification`).set({
      userId: snapshot.data().members[0].userId,
      objectId: context.params.daoId,
      createdAt: new Date(),
      type: NOTIFICATION_TYPES.CREATION_COMMON
    })
  });

export const commonCreationNotification = async (notification: INotificationModel, tokens: [string]) => {

  const commonRef = await admin.firestore().collection('daos').doc(`${notification.objectId}`)
  const common = await commonRef.get().then(doc => { return doc.data() })

  const title = 'Your common was created 🎉';
  const body = `${common.name} is available on common list.`
  const image = common.metadata.avatar || '';

  return Notification.send(tokens, title, body, image);
}
