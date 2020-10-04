const { db } = require('../settings.js');

const updateCard = async (cardId, doc) => (
	await db.collection('cards')
    .doc(cardId)
    .set(
        doc,
        {
            merge: true
        }
    )
)

const updateProposalList = async (cardId, proposals) => {  
  await db.collection('cards')
  .doc(cardId)
  .set({
    proposals
  },{
    merge: true
  });
  return proposals;
}



module.exports = {
    updateCard,
    updateProposalList
};