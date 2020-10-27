import * as functions from 'firebase-functions';
import { NOTIFICATION_TYPES } from '../notification/notification'
import { createNotification } from '../db/notificationDbService';
import {Utils} from '../util/util';

exports.watchForNewMessages = functions.firestore
	.document('/discussionMessage/{id}')
	.onCreate(async (snap) => {
    const message = snap.data();
    const dao = await Utils.getCommonById(message.commonId);
    
    // maybe userFilter should be the users that follow the discussion
    // maybe a user becomes a follower when she comments (and then can unfollow if she wants)
    const userFilter = dao.members.map((member) => member.userId);

    await createNotification({
      eventId: message.discussionId, // eventId is irrelevant here though
      eventType: NOTIFICATION_TYPES.CREATION_MESSAGE,
      eventObjectId: snap.id, // messageId used to get data for notification body
      userFilter,
      createdAt: new Date(),
    });
	})