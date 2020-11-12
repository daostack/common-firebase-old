const { db } = require('../settings.js');
const COLLECTION_NAME = 'proposals';

async function getPayout() {
    let payout = {};
    const data = await db.collection(COLLECTION_NAME)
    .where("winningOutcome", "==", 1)
    .where("type", "==", "FundingRequest")
    .get();

    let proposals = data.docs.map(doc => doc.data())
    for (const property in proposals) {

        const proposal = proposals[property];

        if(proposal.proposerId){
            const user = await db.collection('users').doc(proposal.proposerId).get()
            const userData = user.data()
            proposals[property] = { ...proposal, ...userData}
        }
        
    }
    

    return proposals

}
module.exports = {
    getPayout
}