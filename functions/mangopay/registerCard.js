const Utils = require('../util/util');
const {
  finalizeCardReg,
  preauthorizePayment,
} = require('./mangopay');

const emailClient = require('../email');

// @question Ask Jelle how to proceed with the useless try/catch

const registerCard = async (req) => {
  // eslint-disable-next-line no-useless-catch
  try {

    const { idToken, cardRegistrationData, Id, funding } = req.body;
    const uid = await Utils.verifyId(idToken);
    let userData = await Utils.getUserById(uid);
    const userRef = Utils.getUserRef(uid);
    const cardId = await finalizeCardReg(cardRegistrationData, Id);
    console.log('CARD REGISTERED', cardId);
    await userRef.update({ mangopayCardId: cardId });
    userData = await Utils.getUserById(uid); // update userData with the new cardId which we register each time user pays
    const {
      Id: preAuthId,
      Status,
      DebitedFunds: { Amount },
      ResultMessage,
    } = await preauthorizePayment({ funding, userData });

    if (Status === 'FAILED') {
      await emailClient.sendPreauthorizationFailedEmail(preAuthId)

      throw new Error(`Request to join failed. ${ResultMessage}`);
    }

    return {
      message: 'Card registered successfully',
      preAuthData: { preAuthId, Amount },
    }

  } catch (error) {
    throw error; 
  }
}

 module.exports = { registerCard };
