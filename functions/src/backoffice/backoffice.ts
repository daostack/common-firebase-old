import { db } from '../settings.js'
import { getBalances } from '../circlepay/circlepay';

const DAOS_COLLECTION_NAME = 'daos';
const PAYMENTS_COLLECTION_NAME = 'payments';
const PROPOSALS_COLLECTION_NAME = 'proposals';
const USERS_COLLECTION_NAME = 'users';


export const getCommonBalance = async() : Promise<any> => {
    const data = await db.collection(DAOS_COLLECTION_NAME)
    .get();

    return data.docs.map(doc => doc.data())
}

export const getCircleBalance = async() : Promise<any> => {
    const { data } = (await getBalances()).data;
    return data;
}

export const getPayin = async() : Promise<any> => {

    const data = await db.collection(PAYMENTS_COLLECTION_NAME)
    .orderBy("creationDate", "asc")
    .where("status", "==", "confirmed")
    .get();

    const payments = data.docs.map(doc => doc.data())
    let key = 0;

    for (const property in payments) {

        const payment = payments[property];

        if(!payment.proposalId) continue;
        

        // eslint-disable-next-line no-await-in-loop
        const proposal = await db.collection(PROPOSALS_COLLECTION_NAME).doc(payment.proposalId).get()
        const proposalData = proposal.data()
        if(proposalData){
            payments[key] = { payment: payment, proposal: proposalData}
        }

        if(proposalData){
            //eslint-disable-next-line no-await-in-loop
            const dao = await db.collection(DAOS_COLLECTION_NAME).doc(proposalData.commonId).get()
            const daoData = dao.data()
            if(daoData){
                payments[key] = {...payments[key], common: daoData}
            }
        }

        if(proposalData){
            //eslint-disable-next-line no-await-in-loop
            const user = await db.collection(USERS_COLLECTION_NAME).doc(proposalData.proposerId).get()
            const userData = user.data()
            if(userData){
                payments[key] = {...payments[key], user: userData}
            }
        }
            
        key++;

        
    }
    return payments


}

export const getPayout = async() : Promise<any> => {

    const data = await db.collection(PROPOSALS_COLLECTION_NAME)
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
        const user = await db.collection(USERS_COLLECTION_NAME).doc(proposal.proposerId).get()
        const userData = user.data()
        if(userData){
            filterProposals[key] = {...filterProposals[key], user: userData}
        }

        //eslint-disable-next-line no-await-in-loop
        const dao = await db.collection(DAOS_COLLECTION_NAME).doc(proposal.commonId).get()
        const daoData = dao.data()
        if(daoData){
            filterProposals[key] = {...filterProposals[key], common: daoData}
        }

        // eslint-disable-next-line no-await-in-loop
        const payment = await db.collection(PAYMENTS_COLLECTION_NAME).where("proposalId", "==", proposal.id).limit(1).get()
        if(!payment.empty){
            const paymentData = payment.docs[0].data();
            filterProposals[key] = {...filterProposals[key], payment: paymentData}
        }
        
        key++;
    }
    

    return filterProposals

}
