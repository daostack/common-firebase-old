import { ProposalsCollection, UsersCollection, CommonCollection, PaymentsCollection } from './index';

export async function getPayout():Promise<any> {

    const proposals: any = (await ProposalsCollection
        .orderBy("createdAt", "asc")
        .get()
    ).docs.map(p => p.data());



    const payOutCollection = {};
    let key = 0;
    for (const property in proposals) {

        const proposal = proposals[property];

        if(!proposal.fundingRequest) continue;
        if(proposal.fundingRequest.amount === 0) continue;
        if(proposal.state !== "passed") continue;
        if(proposal.type !== "fundingRequest") continue;
        if(!proposal.proposerId) continue;

        payOutCollection[key] = { proposal: proposal}

        const usersQuery: any = UsersCollection;

        // eslint-disable-next-line no-await-in-loop
        const user = await usersQuery.doc(proposal.proposerId).get()
        const userData = user.data()
        if(userData){
            payOutCollection[key] = {...payOutCollection[key], user: userData}
        }

        const commonsQuery: any = CommonCollection;
        //eslint-disable-next-line no-await-in-loop
        const dao = await commonsQuery.doc(proposal.commonId).get()
        const daoData = dao.data()
        if(daoData){
            payOutCollection[key] = {...payOutCollection[key], common: daoData}
        }
        
        key++;
    }
    

    return payOutCollection
}