const { db } = require('../settings.js');
const COLLECTION_NAME = 'cards';

const updateCard = async (cardId, doc) => (
	await db.collection(COLLECTION_NAME)
    .doc(cardId)
    .set(
        doc,
        {
            merge: true
        }
    )
)

module.exports = {
    updateCard,
};