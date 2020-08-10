const { mangopayClient } = require('../util/mangoPay');
const db = require('firebase-admin').firestore();

async function updateDAOBalance(daoId) {
  const { balance } = await getBalance(daoId);

  await db.collection('daos').doc(daoId).set({
    balance
  }, { merge: true });

  return {
    balance
  };
}

const getCurrentDaoWallet = async (daoId) => {
  const dao = (await db.collection('daos')
    .doc(daoId).get()).data();
  
  return mangopayClient.Wallets.get(dao.mangopayWalletId)
};

const getBalance = async (daoId) => {
  const wallet = await getCurrentDaoWallet(daoId)
    .catch(() => {
      console.log("Cannot find the dao wallet")
    });

  return {
    balance: wallet
      ? wallet.Balance.Amount
      : 0
  };
};

module.exports = {
  getBalance,
  updateDAOBalance,
  getCurrentDaoWallet
};
