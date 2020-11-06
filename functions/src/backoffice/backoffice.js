const { db } = require('../settings.js');
const COLLECTION_NAME = 'proposals';

async function getPayout() {
    const data = await db.collection(COLLECTION_NAME)
    .where("winningOutcome", "==", 1)
    .where("type", "==", "FundingRequest")
    .get();
    return data.docs.map(doc => doc.data())

}
module.exports = {
    getPayout
}