import { db } from '../settings.js'
import { getBalances } from '../circlepay/circlepay';



export async function getBalance():Promise<any> {
    const {data: {data}} = await getBalances();
    return data
}


export async function getPayin():Promise<any> {
    const COLLECTION_NAME = 'proposals';

    const data = await db.collection(COLLECTION_NAME)
    .where("join.funding", ">", 0)
    .where("state", "==", "passed")
    .where("type", "==", "join")
    .get();

    console.log(data)
    const proposals = data.docs.map(doc => doc.data())
    for (const property in proposals) {

        const proposal = proposals[property];

        if(proposal.proposerId){

            // eslint-disable-next-line no-await-in-loop
            const user = await db.collection('users').doc(proposal.proposerId).get()
            const userData = user.data()
            if(userData){
                proposals[property] = { ...proposal, proposalId:proposal.id, ...userData, userId:userData.id}
            }

            //eslint-disable-next-line no-await-in-loop
            const dao = await db.collection('daos').doc(proposal.commonId).get()
            const daoData = dao.data()
            if(daoData){
                proposals[property] = { ...proposals[property], ...daoData, daoId:daoData.id}
            }

            // eslint-disable-next-line no-await-in-loop
            const payment = await db.collection('payments').where("proposalId", "==", proposal.id).limit(1).get()
            if(!payment.empty){
                const paymentData = payment.docs[0].data();
                proposals[property] = { ...proposals[property], ...paymentData, paymentId:paymentData.id}
            }
        }
        
    }
    return proposals


}

export async function getPayout():Promise<any> {
    const COLLECTION_NAME = 'proposals';

    const data = await db.collection(COLLECTION_NAME)
    .where("fundingRequest.amount", ">", 0)
    .where("state", "==", "passed")
    .where("type", "==", "fundingRequest")
    .get();

    console.log(data)
    const proposals = data.docs.map(doc => doc.data())
    for (const property in proposals) {

        const proposal = proposals[property];

        if(proposal.proposerId){

            // eslint-disable-next-line no-await-in-loop
            const user = await db.collection('users').doc(proposal.proposerId).get()
            const userData = user.data()
            if(userData){
                proposals[property] = { ...proposal, proposalId:proposal.id, ...userData, userId:userData.id}
            }

            //eslint-disable-next-line no-await-in-loop
            const dao = await db.collection('daos').doc(proposal.commonId).get()
            const daoData = dao.data()
            if(daoData){
                proposals[property] = { ...proposals[property], ...daoData, daoId:daoData.id}
            }

            // eslint-disable-next-line no-await-in-loop
            const payment = await db.collection('payments').where("proposalId", "==", proposal.id).limit(1).get()
            if(!payment.empty){
                const paymentData = payment.docs[0].data();
                proposals[property] = { ...proposals[property], ...paymentData, paymentId:paymentData.id}
            }
        }
        
    }
    

    return proposals

}
