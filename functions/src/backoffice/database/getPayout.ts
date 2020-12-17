import { ProposalsCollection, UsersCollection, CommonCollection, PaymentsCollection } from './index';

export async function getPayout():Promise<any> {
    const proposalsCollectionQuery: any = ProposalsCollection;

    const proposals = await proposalsCollectionQuery.orderBy("createdAt", "asc").get().docs.map(proposal => proposal.data());
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

        const usersCollectionQuery: any = UsersCollection;

        // eslint-disable-next-line no-await-in-loop
        const user = await usersCollectionQuery.doc(proposal.proposerId).get()
        const userData = user.data()
        if(userData){
            filterProposals[key] = {...filterProposals[key], user: userData}
        }

        const commonsCollectionQuery: any = CommonCollection;
        //eslint-disable-next-line no-await-in-loop
        const dao = await commonsCollectionQuery.doc(proposal.commonId).get()
        const daoData = dao.data()
        if(daoData){
            filterProposals[key] = {...filterProposals[key], common: daoData}
        }

        const paymentsCollectionQuery: any = PaymentsCollection;

        // eslint-disable-next-line no-await-in-loop
        const payment = await paymentsCollectionQuery.where("proposalId", "==", proposal.id).limit(1).get()

        if(!payment.empty){
            const paymentData = payment.docs[0].data();
            filterProposals[key] = {...filterProposals[key], payment: paymentData}
        }
        
        key++;
    }
    

    return filterProposals
}