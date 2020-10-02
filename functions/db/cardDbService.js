const { db } = require('../settings.js');

const updateCard = async (doc) => (
	await db.collection('cards')
    .doc(doc.id)
    .set(
        doc,
        {
            merge: true
        }
    )
)
module.exports = {
    updateCard
};