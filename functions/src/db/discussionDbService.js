const { db } = require('../settings.js');
const COLLECTION_NAME = 'discussion';

async function getDiscussionById(discussionId) {
    return await db.collection(COLLECTION_NAME)
        .doc(discussionId)
        .get();
}

async function getDiscussionRefById(discussionId) {
	//return db.collection(COLLECTION_NAME).doc(discussionId);
    try {
      const discussionRef = db.collection(COLLECTION_NAME).doc(discussionId);
      const discussionData = await discussionRef.get().then(doc => doc.data());
      return discussionData;
    } catch (err) {
      throw new 'discussionError'; //CommonError(CFError.emptyUserData)
    }
}

module.exports = {
    getDiscussionById,
    getDiscussionRefById
};
