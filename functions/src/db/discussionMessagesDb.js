const { db } = require('../settings.js');
const COLLECTION_NAME = 'discussionMessage';

async function getDiscussionMessageById(discussionMessageId) {
    return await db.collection(COLLECTION_NAME)
        .doc(discussionMessageId)
        .get();
}

module.exports = {
    getDiscussionMessageById
};