const { Utils } = require('../../util/util');
const Relayer = require('../relayer');
const { CommonError } = require('../../util/errors');
const { env } = require('../../env');

const execTransaction = async req => {
  const { to, value, data, signature, idToken } = req.body;

  let uid, userData;

  if (env.environment === 'dev') {
    if (!data) {
      throw new CommonError('The "data" param should be passed in the request');
    }

    userData = req.body.user || {};
    userData.safeAddress = data.founderAddresses;
    userData.ethereumAddress = data.founderAddresses;
  } else {
    uid = await Utils.verifyId(idToken);
    userData = await Utils.getUserById(uid);
  }
  
  const safeAddress = userData.safeAddress
  const ethereumAddress = userData.ethereumAddress
  await Relayer.addAddressToWhitelist([to]);
  const response = await Relayer.execTransaction(safeAddress, ethereumAddress, to, value, data, signature)
  // TODO: Once it failed, it will send detail to client which have apiKey
  const success = await Utils.isRelayerTxSuccess(response.data.txHash)
  if (!success) {
    throw new CommonError(`ExecutionFailure while executing ${response.data.txHash}`)
  }
  return response.data;
}

 module.exports = { execTransaction };
