import { db } from '../settings.js'
import { Collections } from '../constants';


export const getPayin = async() : Promise<any> => {

    const data = await db.collection(Collections.Payments)
    .orderBy("creationDate", "asc")
    .where("status", "==", "confirmed")
    .get();

    const payments = data.docs.map(doc => doc.data())
    let key = 0;

    for (const property in payments) {

        const payment = payments[property];

        if(!payment.proposalId) continue;
        

        // eslint-disable-next-line no-await-in-loop
        const proposal = await db.collection(Collections.Proposals).doc(payment.proposalId).get()
        const proposalData = proposal.data()
        if(proposalData){
            payments[key] = { payment: payment, proposal: proposalData}
        }

        if(proposalData){
            //eslint-disable-next-line no-await-in-loop
            const dao = await db.collection(Collections.Commons).doc(proposalData.commonId).get()
            const daoData = dao.data()
            if(daoData){
                payments[key] = {...payments[key], common: daoData}
            }
        }

        if(proposalData){
            //eslint-disable-next-line no-await-in-loop
            const user = await db.collection(Collections.Users).doc(proposalData.proposerId).get()
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

    const data = await db.collection(Collections.Proposals)
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
        const user = await db.collection(Collections.Users).doc(proposal.proposerId).get()
        const userData = user.data()
        if(userData){
            filterProposals[key] = {...filterProposals[key], user: userData}
        }

        //eslint-disable-next-line no-await-in-loop
        const dao = await db.collection(Collections.Commons).doc(proposal.commonId).get()
        const daoData = dao.data()
        if(daoData){
            filterProposals[key] = {...filterProposals[key], common: daoData}
        }

        // eslint-disable-next-line no-await-in-loop
        const payment = await db.collection(Collections.Payments).where("proposalId", "==", proposal.id).limit(1).get()
        if(!payment.empty){
            const paymentData = payment.docs[0].data();
            filterProposals[key] = {...filterProposals[key], payment: paymentData}
        }
        
        key++;
    }
    

    return filterProposals

}
