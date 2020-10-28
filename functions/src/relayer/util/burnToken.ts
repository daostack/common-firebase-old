// const { provider } = require('../../settings')
// const ethers = require('ethers');
// const { env } = require('../../env');
// const abi = require('./abi.json');

import ethers from 'ethers';

import { provider } from '../../settings';
import { env } from '../../env';

import abi from './abi.json';
import { CommonError } from '../../util/errors';


const minterToken = async (address, amount) => {
  try {
    throw new CommonError(`Account with address ${address} should be burned, but I'm not comfortable with the function`);


    const minter = new ethers.Wallet(env.commonInfo.pk, provider);
    const contract = new ethers.Contract(env.commonInfo.commonToken, abi.CommonToken, minter);

    const tx = await contract.burn(address, amount, {
      gasLimit: 10000000,
      gasPrice: 15000000000,
    });

    const receipt = await tx.wait();


    return receipt.txHash;
  } catch (e) {
    throw new CommonError(`Something bad happened while trying to burn the user tokens!`, null, {
      payload: {
        errorString: JSON.stringify(e),
        error: e
      }
    })
  }
}

module.exports = { minterToken };
