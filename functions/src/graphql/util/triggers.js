const functions = require('firebase-functions');
const { updateDaoById } = require('../Dao');
const env = require('@env');
const { createLegalUser, createWallet } = require('../../mangopay/mangopay');
const { createNotification } = require('../../db/notificationDbService');
const { Utils, PROPOSAL_TYPE } = require('../../util/util');

const emailClient = require('../../email');

exports.newProposalCreated = functions
  .firestore
  .document('/proposals/{id}')
  .onCreate(async (snap) => {
    const proposal = snap.data();

    if(proposal.name === PROPOSAL_TYPE.Join) {
      const proposer = await Utils.getUserById(proposal.proposerId);
      const common = await Utils.getCommonById(proposal.dao);

      await emailClient.sendTemplatedEmail({
        to: proposer.email,
        templateKey: 'requestToJoinSubmitted',
        emailStubs: {
          name: proposer.displayName,
          link: Utils.getCommonLink(common.id),
          commonName: common.metadata.name
        }
      })
    }
  })

exports.watchForReputationRedeemed = functions.firestore
  .document('/proposals/{id}')
  .onUpdate(async (change) => {
    const data = change.after.data();
    const previousData = change.before.data();
    if (
      data.type === PROPOSAL_TYPE.Join &&
      previousData.join.reputationMinted === '0' &&
      data.join.reputationMinted !== '0'
    ) {
      console.log(
        'Join proposal reputationMinted changed from "0" Initiating DAO update'
      );
      try {
        await updateDaoById(data.dao);
      } catch (e) {
        console.error(e);
      }
    }
  });

exports.daoUpdated = functions.firestore
  .document('/daos/{id}')
  .onUpdate(async (snap) => {
    const dao = snap.after.data();
    const oldDao = snap.before.data();

    if (dao.register === 'registered' && (dao.register !== oldDao.register)) {
      const creator = await Utils.getUserById(dao.members[0].userId);

      await emailClient.sendTemplatedEmail({
        to: creator.email,
        templateKey: 'userCommonFeatured',
        emailStubs: {
          name: creator.displayName,
          commonName: dao.name,
          commonLink: Utils.getCommonLink(dao.id)
        }
      })
    }
  });

exports.newDaoCreated = functions.firestore
  .document('/daos/{id}')
  .onCreate(async (snap) => {
    let newDao = snap.data();

    const userId = newDao.members[0].userId;
    const userData = await Utils.getUserById(userId);
    
    try {
      const { Id: mangopayId } = await createLegalUser(newDao);
      const { Id: mangopayWalletId } = await createWallet(mangopayId);

      if (mangopayId && mangopayWalletId) {
        
        console.debug(`Sending admin email for CommonCreated to ${env.mail.adminMail}`);
        console.debug(`Sending user email for CommonCreated to ${userData.email}`);

        await createNotification({
          userId: userId,
          objectId: newDao.id,
          createdAt: new Date(),
          type: NOTIFICATION_TYPES.CREATION_COMMON
        });

        return snap.ref.set({ mangopayId, mangopayWalletId }, { merge: true });
      }
    } catch (e) {
      console.error(e);

      await createNotification({
        userId: userId,
        objectId: newDao.id,
        createdAt: new Date(),
        type: NOTIFICATION_TYPES.CREATION_COMMON_FAILED
      });

    }
  });
