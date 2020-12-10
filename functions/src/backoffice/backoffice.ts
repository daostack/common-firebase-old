import { db } from '../settings.js'
import { getBalances } from '../circlepay/circlepay';



export async function getCommonBalance():Promise<any> {
    const COLLECTION_NAME = 'daos';
    const data = await db.collection(COLLECTION_NAME)
    .get();

    const daos = data.docs.map(doc => doc.data())

    return daos
}

export async function getCircleBalance():Promise<any> {
    const {data: {data}} = await getBalances();
    return data
}


export async function getPayin():Promise<any> {
    const COLLECTION_NAME = 'payments';

    const data = await db.collection(COLLECTION_NAME)
    .orderBy("creationDate", "asc")
    .where("status", "==", "confirmed")
    .get();

    const payments = data.docs.map(doc => doc.data())
    for (const property in payments) {

        const payment = payments[property];

        if(payment.proposalId){

            // eslint-disable-next-line no-await-in-loop
            const proposal = await db.collection('proposals').doc(payment.proposalId).get()
            const proposalData = proposal.data()
            if(proposalData){
                payments[property] = { payment: payment, proposal: proposalData}
            }

            if(proposalData){
                //eslint-disable-next-line no-await-in-loop
                const dao = await db.collection('daos').doc(proposalData.commonId).get()
                const daoData = dao.data()
                if(daoData){
                    payments[property] = { ...payments[property], common: daoData}
                }
            }

            if(proposalData){
                //eslint-disable-next-line no-await-in-loop
                const user = await db.collection('users').doc(proposalData.proposerId).get()
                const userData = user.data()
                if(userData){
                    payments[property] = { ...payments[property], user: userData}
                }
            }
            
        }
        
    }
    return payments


}

export async function getPayout():Promise<any> {
    const COLLECTION_NAME = 'proposals';

    const data = await db.collection(COLLECTION_NAME)
    .orderBy("createdAt", "asc")
    .get();

    const proposals = data.docs.map(doc => doc.data())
    const filterProposals = {};
    let key = 0;
    for (const property in proposals) {

        const proposal = proposals[property];

        if(!proposal.fundingRequest) continue;
        if(proposal.fundingRequest.amount === 0) continue;
        if(proposal.state !== "passed") continue;
        if(proposal.type !== "fundingRequest") continue;
        if(!proposal.proposerId) continue;

        filterProposals[key] = { proposal: proposal}
        // eslint-disable-next-line no-await-in-loop
        const user = await db.collection('users').doc(proposal.proposerId).get()
        const userData = user.data()
        if(userData){
            filterProposals[key] = { ...filterProposals[key], user: userData}
        }

        //eslint-disable-next-line no-await-in-loop
        const dao = await db.collection('daos').doc(proposal.commonId).get()
        const daoData = dao.data()
        if(daoData){
            filterProposals[key] = { ...filterProposals[key], common: daoData}
        }

        // eslint-disable-next-line no-await-in-loop
        const payment = await db.collection('payments').where("proposalId", "==", proposal.id).limit(1).get()
        if(!payment.empty){
            const paymentData = payment.docs[0].data();
            filterProposals[key] = { ...filterProposals[key], payment: paymentData}
        }
        
        key++;
    }
    

    return filterProposals

}
