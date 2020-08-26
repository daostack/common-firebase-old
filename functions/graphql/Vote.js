const { findUserByAddress } = require('../db/userDbService');
const { Vote } = require('@daostack/arc.js');
const { arc} = require('../settings')
const admin = require('firebase-admin');
const db = admin.firestore();

async function updateVotes() {

    const votes = await Vote.search(arc, {}, { fetchPolicy: 'no-cache' }).first()
    console.log(`found ${votes.length} votes`)


    const docs = []
    await Promise.all(
      votes.map(async vote =>  {
        const user = await findUserByAddress(vote.voter);

        const voteUserId = user
          ? user.id
          : null;

        const doc = {
            id: vote.id,
            voterAddress: vote.voter,
            voterUserId: voteUserId,
            proposalId: vote.proposal.id,

        }

        await db.collection('votes')
          .doc(vote.id).set(doc);

        docs.push(doc);
    }));

    return docs;
}

module.exports = {
    updateVotes
}
