// const Utils = require('../util/util');
const { IpfsClient, provider } = require('../settings');
const { env } = require('@env');
const { Utils } = require('../util/util');
const { arc, PROPOSAL_TYPE } = require('../settings')
const { cancelPreauthorizedPayment } = require('../mangopay/mangopay');
const { updateProposalById } = require('../graphql/Proposal');
const { first } = require('rxjs/operators');
const Relayer = require('../relayer/relayer');
const ethers = require('ethers');
const abi = require('../relayer/util/abi.json')

const preCreateFundingProposal = async (req) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const {
      idToken,
      daoId,
      data
    } = req.body;

    const uid = await Utils.verifyId(idToken);
    const userData = await Utils.getUserById(uid);
    const IPFS_DATA_VERSION = env.graphql.ipfsDataVersion;
    const dao = arc.dao(daoId);

    const plugins = await dao.plugins().first();
    const abi = arc.getABI({ abiName: 'FundingRequest', version: ARC_VERSION });
    const interf = new ethers.utils.Interface(abi);

    let fundingRequestPlugin;
    try {
      fundingRequestPlugin = await dao.plugin({
        where: { name: 'FundingRequest' },
      });
    } catch (e) {
      console.log(e);
      console.log(daoId);
      const catchPlugins = await dao
        .plugins()
        .pipe(first())
        .toPromise();
      console.log(catchPlugins.map((p) => p.coreState.name));
      throw e;
    }

    console.log('fundingRequestPlugin', fundingRequestPlugin.id);

    const funding = data.funding;
    if (!funding) {
      throw Error('"funding" argument must be given');
    }

    const oldDaoContract = await arc.getContract(dao.id);
    const daoContract = await oldDaoContract.addProvider();

    // lets first check some sanity things about the dao
    const joinPlugin = await dao.plugin({ where: { name: PROPOSAL_TYPE.Join } });
    const joinPluginState = await joinPlugin.fetchState();
    const errorFundingRequestPlugin = await dao.plugin({ where: { name: 'FundingRequest' } });
    const fundingRequestPluginState = await errorFundingRequestPlugin.fetchState();
    const activationTime = fundingRequestPluginState.pluginParams.voteParams.activationTime;
    if (activationTime > ((new Date()).getTime() / 1000)) {
      throw Error(`Canot create a funding request as the plugin is not actived yet (it activates on ${activationTime})`);
    }

    let setFlagTx;

    // TODO: The "FUNDED_BEFORE_DEADLINE" flag can (and should) be set on common creation, not on "first proposal creation"
    let fundingGoalReachedFlag = await daoContract.functions.db('FUNDED_BEFORE_DEADLINE');
    if (fundingGoalReachedFlag !== 'TRUE') {
      const errorJoinPlugin = await dao.plugin({
        where: { name: PROPOSAL_TYPE.Join },
      });
      console.log(`fundingGoalReachedFlag is not TRUE (its value is "${fundingGoalReachedFlag}") - so we cannot create a proposal`);

      const fundingGoal = Number(joinPluginState.pluginParams.fundingGoal);
      console.log(`funding goal: ${fundingGoal}`);
      if (fundingGoal !== 0) {
        throw Error(`Invalidly configured DAO - funding goal is not 0, it is ${fundingGoal} instead`);
      }

      // TODO: check fundingGoal < dao.balance ?

      if (joinPluginState.pluginParams.fundingGoalDeadline < new Date()) {
        throw Error('Invalidly configured DAO - cannot create funding request (the fundingGoalDeadline of the join plugin is in the past, so we cannot set the fundingGoalReeched flag to true)');
      }
      console.log('We will try to reset the fundingGoalReachedFlag');
      const joinContract = await arc.getContract(errorJoinPlugin.coreState.address);
      const encodedData = joinContract.interface.functions.setFundingGoalReachedFlag.encode([]);
      const safeTxHash = await Utils.createSafeTransactionHash(userData.safeAddress, joinContract.address, '0', encodedData);
      setFlagTx = { encodedData, safeTxHash, toAddress: joinContract.address }

      console.log(setFlagTxReceipt);
      console.log('setFlagTxReceipt.transactionHash ->', setFlagTxReceipt.transactionHash);
      fundingGoalReachedFlag = await daoContract.db('FUNDED_BEFORE_DEADLINE');
      console.log(`fundingGoalReachedFlag value is now ${fundingGoalReachedFlag}`);
      if (fundingGoalReachedFlag !== 'TRUE') {
        throw Error('funding goal is not reached yet - cannot create a funding request');
      }
    }

    // TODO: check if the user is a member
    const ipfsdata = { ...data, VERSION: IPFS_DATA_VERSION };
    const ipfsHash = await ipfsUpload({ description: JSON.stringify(ipfsdata)});
    console.log('ipfsHash', ipfsHash);

    const params = {
      descriptionHash: ipfsHash,
      amount: funding,
      beneficiary: userData.safeAddress,
      dao: dao.id,
      plugin: fundingRequestPlugin.coreState.address,
    };

    // send the acdtual transaction
    const { contract, method, args } = await fundingRequestPlugin.createProposalTransaction(params);
    const encodedData = contract.interface.functions[method].encode(args);
    const safeTxHash = await Utils.createSafeTransactionHash(userData.safeAddress, contract.address, '0', encodedData);
    return { fundingRequestTx: { encodedData, safeTxHash, toAddress: contract.address }, setFlagTx }

  } catch (error) {
    throw error;
  }
}

const createFundingProposal = async (req) => {
  // eslint-disable-next-line no-useless-catch
  try {

    console.log('---requestToJoin---')

    const {
      idToken,
      createProposalTx, // This is the signed transacxtion to create the proposal. 
      preAuthId,
    } = req.body;
    const uid = await Utils.verifyId(idToken)
    const userData = await Utils.getUserById(uid);
    const safeAddress = userData.safeAddress
    const ethereumAddress = userData.ethereumAddress



    await updateProposalById(proposalId, { retries: 8 });
    return { txHash: response.data.txHash, proposalId: proposalId }
  } catch (error) {
    console.error('Request to join failed')
    throw error;
  }
}

module.exports = { preCreateFundingProposal, createFundingProposal };
