import * as functions from 'firebase-functions';
import { getUserById } from '../util/db/userDbService';
import Notification from './notification';
import emailClient from './email';
import { notifyData } from './notification';
import { EVENT_TYPES } from '../event/event';

export interface INotificationModel {
    userFilter: string[],
    createdAt: string,
    eventObjectId: string,
    eventType: string,
    eventId: string,
}

const processNotification = async (notification: INotificationModel) => {

    const currNotifyObj = notifyData[notification.eventType];

    if (!currNotifyObj.data) {
        throw Error(`Not found data method for notification on event type "${notification.eventType}".`);
    }

    let sendOnlyOnce = false;
    const eventNotifyData = await currNotifyObj.data(notification.eventObjectId);
    if (notification.userFilter) {
        // const eventNotifyData = await currNotifyObj.data(notification.eventObjectId);
        notification.userFilter.forEach( async filterUserId => {
            const userData: any = (await getUserById(filterUserId)).data();

            if (currNotifyObj.notification) {
                const {title, body, image, path} = await currNotifyObj.notification(eventNotifyData);
                console.log('notify ', userData.email)
                await Notification.send(userData.tokens, title, body, image, path);
            }

            if (currNotifyObj.email && !sendOnlyOnce) {
                // userFilter for common whitelist contains all db users, but we only want to send one email - to the common creator
                sendOnlyOnce = notification.eventType === EVENT_TYPES.COMMON_WHITELISTED
                const emailTemplate = currNotifyObj.email(eventNotifyData);
                const emailTemplateArr = Array.isArray(emailTemplate) ? emailTemplate : [emailTemplate];
                emailTemplateArr.forEach( async (currEmailTemplate) => {
                    const template = currEmailTemplate;
                    await emailClient.sendTemplatedEmail(template);
                });
            }

        });
    } 
    if (currNotifyObj.email) {
      const emailTemplate = currNotifyObj.email(eventNotifyData);
      const emailTemplateArr = Array.isArray(emailTemplate) ? emailTemplate : [emailTemplate];
      emailTemplateArr.forEach( async (currEmailTemplate) => {
          const template = currEmailTemplate;
          console.log('sendTemplate to', template.to)
          //await emailClient.sendTemplatedEmail(template);
      });
    }


    else {
        const eventNotifyData = await currNotifyObj.data(notification.eventObjectId);
        if (currNotifyObj.notification) {
            const {title, body, image, path} = currNotifyObj.notification(eventNotifyData);
            await Notification.sendToAllUsers(title, body, image, path);
        }

        // if (currNotifyObj.email) {
        //     await emailClient.sendTemplatedEmail(currNotifyObj.email(eventNotifyData))
        // }
    }
        
}

exports.commonNotificationListener = functions
  .firestore
  .document('/notification/{id}')
  .onCreate(async (snap) => {
    return processNotification(snap.data() as INotificationModel);
  })
