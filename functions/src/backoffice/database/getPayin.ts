import { PaymentsCollection, ProposalsCollection, CommonCollection, UsersCollection } from './index';

export async function getPayin():Promise<any> {
    const paymentsCollectionQuery: any = PaymentsCollection;
    const payments = await paymentsCollectionQuery.orderBy("creationDate", "asc").where("status", "==", "confirmed").get().docs.map(payment => payment.data());


    let key = 0;

    for (const property in payments) {

        const payment = payments[property];

        if(!payment.proposalId) continue;
        
        const proposalsCollectionQuery: any = ProposalsCollection;

        // eslint-disable-next-line no-await-in-loop
        const proposal = await proposalsCollectionQuery.doc(payment.proposalId).get()
        const proposalData = proposal.data()
        if(proposalData){
            payments[key] = { payment: payment, proposal: proposalData}
        }

        if(proposalData){
            const commonCollectionQuery: any = CommonCollection;

            //eslint-disable-next-line no-await-in-loop
            const dao = await commonCollectionQuery.doc(proposalData.commonId).get()
            const daoData = dao.data()
            if(daoData){
                payments[key] = {...payments[key], common: daoData}
            }
        }

        if(proposalData){
            const usersCollectionQuery: any = UsersCollection;

            //eslint-disable-next-line no-await-in-loop
            const user = await usersCollectionQuery.doc(proposalData.proposerId).get()

            const userData = user.data()
            if(userData){
                payments[key] = {...payments[key], user: userData}
            }
        }
            
        key++;

        
    }
    return payments
}