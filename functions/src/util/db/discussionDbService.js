// @ts-ignore
const { db } = require('../../settings');
const COLLECTION_NAME = 'discussion';

async function getDiscussionById(discussionId) {
    return await db.collection(COLLECTION_NAME)
        .doc(discussionId)
        .get();
}

// get all discussion messages of a discussion, descending order
async function getDiscussionMessagesByDiscussionId(discussionId) {
	return await db.collection('discussionMessage')
      .where('discussionId', '==', discussionId)
      .orderBy('createTime', 'desc').get();
}

module.exports = {
    getDiscussionById,
    getDiscussionMessagesByDiscussionId,
};
