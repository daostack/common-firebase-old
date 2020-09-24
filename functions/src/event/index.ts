import * as functions from 'firebase-functions';
import { notifyData } from '../notification/notification'

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
    objectId: string,
    type: string,
    createdAt: string,
}

const processEvent = async (event: IEventModel) => {
  
  // Notification creation on event
  if (event.type in notifyData) {
    const currNotifyObj = notifyData[event.type];
    

    
  }   
}

exports.commonEventListener = functions
  .firestore
  .document('/event/{id}')
  .onCreate(async (snap) => {
    await processEvent(snap.data() as IEventModel)
  })