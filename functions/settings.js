const {ethers, Contract} = require('ethers');
const { Arc } = require('@daostack/arc.js');
const { env } = require('@env');
const IPFSApiClient = require('./util/IPFSClient')
const gql = require('graphql-tag');

const graphHttpLink = env.graphql.graphqlHttpProvider;
const graphwsLink = env.graphql.graphqlWsProvider;
const databaseURL = env.firebase.databaseURL;
const jsonRpcProvider = env.blockchain.jsonRpcProvider;
const mangoPayApi = env.mangopay.apiUrl;
const ipfsDataVersion = env.graphql.ipfsDataVersion;

const ipfsProvider = 'https://api.thegraph.com/ipfs-daostack/api/v0';

const retryOptions = {
    retries: 4, // The maximum amount of times to retry the operation. Default is 10.
    factor: 2, // The exponential factor to use. Default is 2.
    minTimeout: 1000, //The number of milliseconds before starting the first retry. Default is 1000.
    randomize: false, //Randomizes the timeouts by multiplying with a factor between 1 to 2. Default is false.
};

const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
// const provider = new ethers.providers.JsonRpcProvider('https://dai.poa.network');

console.log('jsonRpcProvider ->', provider);

const arc = new Arc({
  graphqlHttpProvider: 'https://api.thegraph.com/subgraphs/name/daostack/v8_11_exp_kovan',
  graphqlWsProvider: 'wss://api.thegraph.com/subgraphs/name/daostack/v8_11_exp_kovan',
  ipfsProvider: ipfsProvider,
  web3Provider: provider,
});

ethers.Contract.prototype.addProvider = async function() {
  return new Contract(this.address, this.interface.abi, provider);
};


Arc.prototype.fetchAllContrarcts = async function () {
  console.log('AAAAA -->');
  let allContractInfos = [];
  let contractInfos = null;
  let skip = 0;

  do {
    const query = gql`
    query AllContractInfos {
      contractInfos(first: 1000 skip: ${skip * 1000}) {
        id
        name
        version
        address
        alias
      }
    }
  `;
    // eslint-disable-next-line no-await-in-loop
    const response = await this.sendQuery(query);
    contractInfos = response.data.contractInfos;
    allContractInfos.push(...contractInfos);
    skip++;
  } while (contractInfos && contractInfos.length > 0);

  const universalContracts = await this.fetchUniversalContractInfos();
  allContractInfos.push(...universalContracts);
  this.setContractInfos(allContractInfos);
  console.log('ARC 2 --> setContractInfos');
  return allContractInfos;
}

arc.fetchAllContrarcts();

const IpfsClient = new IPFSApiClient(ipfsProvider);

const PROPOSAL_TYPE = {
  Join: 'Join',
  FundingRequest: 'FundingRequest',
};


module.exports = {
    arc,
    IpfsClient,
    graphwsLink,
    graphHttpLink,
    databaseURL,
    jsonRpcProvider,
    mangoPayApi,
    provider,
    retryOptions,
    ipfsDataVersion,
    PROPOSAL_TYPE,
}
