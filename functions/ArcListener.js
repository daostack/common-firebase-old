const { Arc } = require('@daostack/arc.js');
const admin = require('firebase-admin');

const graphHttpLink =
  'https://api.thegraph.com/subgraphs/name/daostack/v7_5_exp_rinkeby';
const graphwsLink =
  'wss://api.thegraph.com/subgraphs/name/daostack/v7_5_exp_rinkeby';

const arc = new Arc({
  graphqlHttpProvider: graphHttpLink,
  graphqlWsProvider: graphwsLink,
});



function updateDaos() {
  //loop that runs a function every 15 seconds for 3 intervals
  try {
    const db = admin.firestore();
    arc
      .daos({}, {subscribe: true, fetchAllData: true})
      .subscribe(res => {
        res.map(async (dao, i) => {
          // const state = await dao.fetchState()
          // console.log(state)
          const {id, address ,
            memberCount ,
            name ,
            numberOfBoostedProposals ,
            numberOfPreBoostedProposals ,
            numberOfQueuedProposals ,
            register,
            reputation,
            reputationTotalSupply,
          } = dao.coreState;
            const joinAndQuitPlugins = await dao.plugins({ where: {name: 'JoinAndQuit'}}).first()
            if (joinAndQuitPlugins.length == 0) {
              // this is not a correctly configured Common DAO

              try {
                await db.collection('daos').doc(id).set({
                  id,
                  address,
                  memberCount,
                  name,
                  numberOfBoostedProposals,
                  numberOfPreBoostedProposals,
                  numberOfQueuedProposals,
                  register,
                  reputationId: reputation.id,
                  reputationTotalSupply: parseInt(reputationTotalSupply),
                })
              } catch(e) {
                console.error('Failed to updated DAOs: ', error);
              }
            } else {
              console.log('JaQ PLUGINS: ', joinAndQuitPlugins);
              const joinAndQuitPlugin = joinAndQuitPlugins[0]
              const {
                fundingGoal,
                minFeeToJoin,
                memberReputation
              } = joinAndQuitPlugin.coreState.pluginParams;



              try {
                await db.collection('daos').doc(id).set({
                  id,
                  address ,
                  memberCount ,
                  name ,
                  numberOfBoostedProposals ,
                  numberOfPreBoostedProposals ,
                  numberOfQueuedProposals ,
                  register,
                  reputationId: reputation.id,
                  reputationTotalSupply: parseInt(reputationTotalSupply),
                  fundingGoal: fundingGoal.toString(),
                  minFeeToJoin: minFeeToJoin.toString(),
                  memberReputation: memberReputation.toString()
                })
                console.log(`[ Updated DAO ${name}@${address}] `);
              } catch(error) {
                console.error('Failed to updated DAOs: ', error);
              };
            // }
x
          }
          if (dao.coreState.name.includes('Test DAO') || dao.coreState.name.includes('Car DAO')) {
            console.log('DELETING: ', id)
            await db.collection('daos').doc(id).delete();
          }

        })
      });
  } catch(e) {
    console.log('Error querying DAOs: ', e)
    throw(e)
  }
}

module.exports = {
  updateDaos
}
