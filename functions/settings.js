const env = require('./_keys/env.json');

const graphHttpLink = 'https://api.thegraph.com/subgraphs/name/daostack/v8_2_exp_xdai'
const graphwsLink = 'wss://api.thegraph.com/subgraphs/name/daostack/v8_2_exp_xdai'
const databaseURL = 'https://common-daostack.firebaseio.com'
const jsonRpcProvider = 'https://dai.poa.network/'
const mangoPayApi = `https://api.sandbox.mangopay.com/v2.01/${env.mangopay.clientId}`

module.exports = {
    graphwsLink,
    graphHttpLink,
    databaseURL,
    jsonRpcProvider,
    mangoPayApi
}
