import { PaymentsCollection, ProposalsCollection, CommonCollection, UsersCollection } from './index';

export async function getPayin():Promise<any> {

    const paymentsQuery: any = PaymentsCollection;
    paymentsQuery.orderBy("creationDate", "asc").where("status", "==", "confirmed")

    
    const payments = (await paymentsQuery.get()).docs
    .map(payment => payment.data()) || [];

    let key = 0;

    for (const property in payments) {

        const payment = payments[property];

        if(!payment.proposalId) continue;
        
        const proposalsQuery: any = ProposalsCollection;
        proposalsQuery.orderBy("createdAt", "asc")

        // eslint-disable-next-line no-await-in-loop
        const proposal = (await proposalsQuery.doc(payment.proposalId).get())
        const proposalData = proposal.data()
        if(proposalData){
            payments[key] = { payment: payment, proposal: proposalData}
        }

        if(proposalData){
            const commonQuery: any = CommonCollection;

            //eslint-disable-next-line no-await-in-loop
            const dao = await commonQuery.doc(proposalData.commonId).get()
            const daoData = dao.data()
            if(daoData){
                payments[key] = {...payments[key], common: daoData}
            }
        }

        if(proposalData){
            const usersQuery: any = UsersCollection;
            usersQuery.orderBy("createdAt", "asc")

            //eslint-disable-next-line no-await-in-loop
            const user = await (usersQuery.doc(proposalData.proposerId).get())

            const userData = user.data()
            if(userData){
                payments[key] = {...payments[key], user: userData}
            }
        }
            
        key++;

        
    }
    return payments
}