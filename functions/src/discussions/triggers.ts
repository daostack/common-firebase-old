import * as functions from 'firebase-functions';
import { NOTIFICATION_TYPES } from '../notification/notification'
import { createNotification } from '../db/notificationDbService';
import {Utils} from '../util/util';
//import {getDiscussionRefById} from '../db/discussionDbService';

exports.watchForNewMessages = functions.firestore
	.document('/discussionMessage/{id}')
	.onCreate(async (snap) => {
    console.log('snap', snap.data())
    //const 
    const commonId = snap.data().commonId;
    const dao = await Utils.getCommonById(commonId);
    const userFilter = dao.members.map((member) => member.userId);
    
    //const discussion = await getDiscussionRefById(snap.data().discussionId);
    //const dao = await Utils.getCommonById(commonId);
    /*
    ownerId
    ownerName
    createTime
    discussionId
    commonId
    text
     */
    await createNotification({
      //eventId: event.id,
      eventType: NOTIFICATION_TYPES.CREATION_MESSAGE,
      //eventObjectId: event.objectId, // ask Lyubo we dont have event though
      userFilter,
      createdAt: new Date(),
    });
	})