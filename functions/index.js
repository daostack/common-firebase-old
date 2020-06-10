const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp({
  credential: admin.credential.cert(require('./_keys/adminsdk-keys.json')),
  databaseURL: "https://common-daostack.firebaseio.com",  // TODO: move to ./settings.js
});

const ethers = require('ethers');
const Notification = require('./Notification');
const Relayer = require('./Relayer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {updateDaos, updateProposals, test, updateUsers} = require('./ArcListener')
const abi = require('./abi.json');
const env = require('./_keys/env');


const privateKey = env.wallet_info.private_key;
const provider = new ethers.providers.JsonRpcProvider('https://dai.poa.network/'); // TODO: move to ./settings.js

let wallet = new ethers.Wallet(privateKey, provider);
let amount = ethers.utils.parseEther('0.1');

// create an Arc instance
const app = express();

// Automatically allow cross-origin requests
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(cors({ origin: true }));


// const messaging = admin.messaging();

app.get('/', async (req, res) => {
  const message = "G'day mate";
  res.send({ message })
});


app.get('/test', async (req, res) => {
  const message = await test()
  res.send(message)
})
app.get('/update-daos', async (req, res) => {
  try {
    const result = await updateDaos();
    const code = 200;
    res.status(code).send(`Updated DAOs successfully: ${result}`);
  } catch (e) {
    const code = 500;
    console.log(e)
    res.status(code).send(new Error(`Unable to update DAOs: ${e}`));
  }

});

app.get('/update-proposals', async (req, res) => {
  try {
    const result = await updateProposals();
    const code = 200;
    res.status(code).send(`Updated ${result.length} proposals`);
  } catch(e) {
    const code = 500;
    console.log(e)
    res.status(code).send(new Error(`Unable to update Proposals: ${e}`));
  }

});
app.get('/update-users', async (req, res) => {
  try {
    const result = await updateUsers();
    const code = 200;
    res.status(code).send(`Updated users successfully: ${result}`);
  } catch(e) {
    const code = 500;
    console.log(e)
    res.status(code).send(new Error(`Unable to update users: ${e}`));
  }

});


app.get('/send-test-eth/:address', async (req, res) => {
  try {
    const address = req.param("address");
    console.log('address: ', address);
    if (address) {
      let balance = ethers.utils.formatEther(await provider.getBalance(address));
      console.log(address + ': ' + balance);
      if (balance > 0.5) {
        const code = 200;
        res.status(code).send('Balance exceeds 0.1 ETH: ', balance);
        return
      }


      let tx = {
        to: address,
        value: amount
      };

      let transaction = await wallet.sendTransaction(tx);
      console.log(transaction);
      const code = 200;
      res.status(code).send(`Successful transaction: ${transaction.hash}`);

    }

  } catch (e) {
    const code = 500;
    res.status(code).send(new Error('Unable to send transaction'));
  }
});

app.get('/createWallet', async (req, res) => {
  try {
    const idToken = req.header('idToken');
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid;
    const userRef = admin.firestore().collection('users').doc(uid)
    const userData = await userRef.get().then(doc => { return doc.data() })
    const address = userData.ethereumAddress
    const response = await Relayer.createWallet(address)
    const txHash = response.data.txHash
    const safeAddress = await Relayer.getAddressFromEvent(txHash)
    await userRef.update({safeAddress: safeAddress.toLowerCase()})
    await Relayer.addAddressToWhitelist([address]);
    const whitelist = await Relayer.addProxyToWhitelist([safeAddress]);
    res.send({txHash, safeAddress, whitelist: whitelist.data.message})
  } catch (err) {
    res.send(err);
  }
})

app.get('/create2Wallet', async (req, res) => {
  try {

    // TODO: Change this with calculate address
    // SaltNonce need to change
    const idToken = req.header('idToken');
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid;
    const userData = await admin.firestore().collection('users').doc(uid).get().then(doc => { return doc.data() })
    const address = userData.ethereumAddress
    const options = { headers: { 'x-api-key': env.biconomy.apiKey, 'Content-Type': 'application/json' } }
    const iface = new ethers.utils.Interface(abi.MasterCopy);
    const zeroAddress = `0x${'0'.repeat(40)}`;
    const encodedData = iface.functions.setup.encode([
      [address],
      1,
      zeroAddress,
      '0x',
      zeroAddress,
      zeroAddress,
      '0x',
      zeroAddress,
    ]);
    const nonceSalt = Math.floor(Math.random() * 10000000000);
    const data = {
      'apiId': env.biconomy.create2Proxy,
      'to': env.biconomy.proxyFactory,
      'from': address,
      'params': [env.biconomy.masterCopy, encodedData, nonceSalt]
    }

    const testAddress = ethers.utils.getContractAddress({ from: env.biconomy.proxyFactory, nonce: nonceSalt })
    axios.post('https://api.biconomy.io/api/v2/meta-tx/native', data, options)
      .then(receive => {
        let object = Object.assign(receive.data, { address: testAddress, nonce: nonceSalt })
        res.send(object);
      })
      .catch(err => {
        res.send(err);
      })
  } catch (err) {
    res.send(err);
  }
})

app.get('/addWhitleList', async (req, res) => {
  try {
    const idToken = req.header('idToken');
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid;
    const userData = await admin.firestore().collection('users').doc(uid).get().then(doc => { return doc.data() })
    const address = userData.safeAddress
    const result = await Relayer.addProxyToWhitelist([address]);
    res.send(result.data);
  } catch (err) {
    res.send(err);
  }
})

app.post('/execTransaction', async (req, res) => {
  try {
    // const idToken = req.header('idToken');
    const {to, value, data, signature, idToken} = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid;
    const userData = await admin.firestore().collection('users').doc(uid).get().then(doc => { return doc.data() })
    const safeAddress = userData.safeAddress
    const ethereumAddress = userData.ethereumAddress
    await Relayer.addAddressToWhitelist([to]);
    const response = await Relayer.execTransaction(safeAddress, ethereumAddress, to, value, data, signature)
    // TODO: Once it failed, it will send detail to client which have apiKey
    res.send(response.data);
  } catch (err) {
    res.send(err);
  }
})

app.post('/requestToJoin', async (req, res) => {
  try {
    const {
      idToken,
      to1,
      value1,
      data1,
      signature1,
      to2,
      value2,
      data2,
      signature2
    } = req.body;
    // const {to, value, data, signature, idToken, plugin} = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid;
    const userData = await admin.firestore().collection('users').doc(uid).get().then(doc => { return doc.data() })
    const safeAddress = userData.safeAddress
    const ethereumAddress = userData.ethereumAddress

    // TODO: replace with estimate gas
    const OVERRIDES = {
        gasLimit: 10000000,
        gasPrice: 15000000000,
    };

    let minter = new ethers.Wallet(env.commonInfo.pk, provider);
    let contract = new ethers.Contract(env.commonInfo.commonToken, abi.CommonToken, minter);
    let tx = await contract.mint(safeAddress, ethers.utils.parseEther('0.1'), OVERRIDES);
    let receipt = await tx.wait();

    if (!receipt) {
      res.send({ error: 'Claim Token failed', errorCode: 101})
    }

    await Relayer.addAddressToWhitelist([to1, to2]);

    let allowance = await contract.allowance(safeAddress, to2);
    const allowanceStr = ethers.utils.formatEther(allowance);

    // If allowance is 0.0, we need approve the allowance
    if (allowanceStr === '0.0') {
      const response = await Relayer.execTransaction(safeAddress, ethereumAddress, to1, value1, data1, signature1)
      if (response.status !== 200) {
        res.send({error: 'Approve address failed', errorCode: 102})
        return
      }

      const response2 = await Relayer.execTransaction(safeAddress, ethereumAddress, to2, value2, data2, signature2)
      if (response2.status !== 200) {
        res.send({error: 'Request to join failed', errorCode: 104})
        return
      }

      // const receipt = await provider.waitForTransaction(response2.data.txHash);
      // Test case
      const receipt = await provider.waitForTransaction('0x073405e6bdd1d053e8af3ee17cc2399648f723fd9e55607de7087102dd13f199');
      const interf = new ethers.utils.Interface(abi.JoinAndQuit)  
      const events = getTransactionEvents(interf, receipt)

      if (!events.JoinInProposal) {
        res.send({mint: tx.hash, allowance: allowanceStr, joinHash: response2.data.txHash, msg: 'Join in failed'})
        return
      }

      const proposalId = events.JoinInProposal._proposalId

      if (proposalId && proposalId.length) {
        // await updateProposals(proposalId);
        res.send({mint: tx.hash, allowance: allowanceStr, joinHash: response2.data.txHash, proposalId: proposalId});
        return;
      }

      res.send({mint: tx.hash, allowance: allowanceStr, joinHash: response2.data.txHash, msg: 'Join in failed'});

    } else {

      const response2 = await Relayer.execTransaction(safeAddress, ethereumAddress, to2, value2, data2, signature2)
      if (response2.status !== 200) {
        res.send({error: 'Request to join failed', errorCode: 104})
        return
      }

      const receipt = await provider.waitForTransaction(response2.data.txHash);
      // Test case
      // const receipt = await provider.waitForTransaction('0x073405e6bdd1d053e8af3ee17cc2399648f723fd9e55607de7087102dd13f199');
      const interf = new ethers.utils.Interface(abi.JoinAndQuit)  
      const events = getTransactionEvents(interf, receipt)

      if (!events.JoinInProposal) {
        res.send({mint: tx.hash, allowance: allowanceStr, joinHash: response2.data.txHash, msg: 'Join in failed'})
        return
      }

      const proposalId = events.JoinInProposal._proposalId

      if (proposalId && proposalId.length) {
        // await updateProposals(proposalId);
        res.send({mint: tx.hash, allowance: allowanceStr, joinHash: response2.data.txHash, proposalId: proposalId});
        return;
      }

      res.send({mint: tx.hash, allowance: allowanceStr, joinHash: response2.data.txHash, msg: 'Join in failed'});
    }
    
    res.send({error: 'Should not be here', errorCode: 105})
  } catch (err) {
    res.send(err);
  }
})

function getTransactionEvents (interf, receipt) {
  const txEvents = {};
  const abiEvents = Object.values(interf.events);
  for (const log of receipt.logs)
  {
      for (const abiEvent of abiEvents)
      {
          if (abiEvent.topic === log.topics[0])
          {
              txEvents[abiEvent.name] = abiEvent.decode(log.data, log.topics);
              break;
          }
      }
  }
  return txEvents;
}

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);


exports.listenToTransaction = functions.firestore.document('/notification/transaction/{uid}/{txHash}')
  .onCreate(async (change, context) => {
    const uid = context.params.uid;
    const txHash = context.params.txHash;

    const tokenRef = admin.firestore().collection('users').doc(uid)
    const tokens = await tokenRef.get().then(doc => { return doc.data().tokens })

    console.log("Token: ", tokens);
    const receipt = await provider.waitForTransaction(txHash);

    let title;
    let body;

    if (receipt.status === 0) {
      title = "❌ Your transaction have failed"
      body = txHash
    } else {
      title = "✅ Your transaction have been confirmed"
      body = txHash
    }

    return Notification.send(tokens, title, body);
  });

// Follow User
function follow(userId, userList) {
  console.log('Follow User', userId, userList);
  for (var targetUid of userList) {
    console.log('New follow', userId, targetUid);
    const writeNotifications = admin.firestore().doc(`notification/follow/${userId}/${targetUid}`).set({ createdAt: new Date() }, { merge: false });
    const writeFollow = admin.firestore().doc(`users/${targetUid}`).update({ follower: admin.firestore.FieldValue.arrayUnion(userId) })
    // tasks.append(writeNotifications)
    // tasks.append(writeFollow)
    Promise.all([writeNotifications, writeFollow]);
  }
}

function unfollow(userId, userList) {
  // let tasks = [];
  for (const targetUid of userList) {
    const writeUnFollow = admin.firestore().doc(`users/${targetUid}`).update({ follower: admin.firestore.FieldValue.arrayRemove(userId) })
    Promise.all([writeUnFollow]);
  }
}

exports.userInfoTrigger = functions.firestore.document('/users/{userId}')
  .onUpdate(async (change, context) => {

    Array.prototype.diff = function (a) {
      return this.filter(function (i) { return a.indexOf(i) < 0; });
    };

    const userId = context.params.userId;
    const txBList = change.before.get('transactionHistory')
    const txAList = change.after.get('transactionHistory')
    if (JSON.stringify(txBList) !== JSON.stringify(txAList)) {
      const txHash = txAList.pop();
      console.log('New transaction', userId, txHash);
      return admin.firestore().doc(`notification/transaction/${userId}/${txHash}`).set({ createdAt: new Date() })
    }

    const followB = change.before.get('following')
    const followA = change.after.get('following')
    const diffFollow = followB.diff(followA).concat(followA.diff(followB));
    console.log('diffFollow', diffFollow);
    if (diffFollow.length > 0) {
      if (followB.length > followA.length) {
        console.log('UNFOLLOW')
        unfollow(userId, diffFollow);
      } else {
        console.log('FOLLOW')
        follow(userId, diffFollow);
      }
    }
    return Promise.resolve(null);
  })

exports.sendFollowerNotification = functions.firestore.document('/notification/follow/{userId}/{targetUid}')
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const targetUid = context.params.targetUid;
    // response.send(`Change: ${change.after.val()} - ID: ${commonId}`)

    console.log(`uid: ${targetUid} - ID: ${userId}`);
    const tokenRef = admin.firestore().collection('users').doc(`${targetUid}`)
    const tokens = await tokenRef.get().then(doc => { return doc.data().tokens })
    const follower = await admin.auth().getUser(userId);

    console.log(`tokens: ${tokens}  - follower: ${follower.displayName}`);

    let title = 'You have a new follower';
    let body = `${follower.displayName} is now following you.`
    let image = follower.photoURL

    return Notification.send(tokens, title, body, image);
  })

//
// '* * * * *'
// minute hour dayofmonth month dayofweek

// "every five minutes"
// '*/5 * * * *
// exports.scheduledFunction = functions.pubsub.schedule('*/5 * * * *').onRun((context) => {
//   updateDaos();
//   return null;
// });
