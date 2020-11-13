import { db } from '../settings.js'

export async function getPayout() {
    const COLLECTION_NAME = 'proposals';

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
            if(userData){
                proposals[property] = { ...proposal, proposalId:proposal.id, ...userData, userId:userData.id}
            }

            const dao = await db.collection('daos').doc(proposal.dao).get()
            const daoData = dao.data()
            if(daoData){
                proposals[property] = { ...proposals[property], ...daoData, daoId:daoData.id}
            }

            const payment = await db.collection('payments').where("proposalId", "==", proposal.id).limit(1).get()
            if(!payment.empty){
                const paymentData = payment.docs[0].data();
                proposals[property] = { ...proposals[property], ...paymentData, paymentId:paymentData.id}
            }
        }
        
    }
    

    return proposals

}
