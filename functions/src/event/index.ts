import * as functions from 'firebase-functions';
import { notifyData } from '../notification/notification'
import { createNotification } from '../db/notificationDbService';
import { eventData } from './event'


export enum EVENT_TYPES {
  //CREATION notifications
  CREATION_COMMON = 'creationCommon',
  CREATION_COMMON_FAILED = 'creationCommonFailed',
  CREATION_PROPOSAL = 'creationProposal',
  CREATION_REQUEST_TO_JOIN = 'creationReqToJoin',
  //APPROVED notifications
  APPROVED_REQUEST_TO_JOIN = 'approvedReqToJoin',
  APPROVED_PROPOSAL = 'approvedProposal',
  //REJECTED notifications
  REJECTED_REQUEST_TO_JOIN = 'approvedReqToJoin',
  REJECTED_PROPOSAL = 'rejectedProposal',
  
}

export interface IEventModel {
    id: string,
    objectId: string,
    type: string,
    createdAt: string,
}

const processEvent = async (event: IEventModel) => {
  
  // Create Notification object based on event
  if (event.type in notifyData) {
    const currNotifyObj = eventData[event.type];

    const currEventObject = await currNotifyObj.eventObject(event.objectId);
    const userFilter = await currNotifyObj.notifyUserFilter(currEventObject);

    await createNotification({
      eventId: event.id,
      eventType: event.type,
      eventObjectId: event.objectId,
      userFilter,
      createdAt: new Date(),
    });
  }   
}

exports.commonEventListener = functions
  .firestore
  .document('/event/{id}')
  .onCreate(async (snap) => {
    await processEvent(snap.data() as IEventModel)
  })