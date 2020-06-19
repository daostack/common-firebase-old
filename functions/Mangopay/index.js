const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const mangopay = express();
const cors = require('cors');

const {
  createUser,
  /* createWallet,
  registerCard,
  payToDAOStackWallet, */
} = require('./Mangopay');

const runtimeOptions = {
  timeoutSeconds: 540, // Maximum time 9 mins
};

mangopay.use(bodyParser.json()); // to support JSON-encoded bodies
mangopay.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
mangopay.use(express.json()); // to support JSON-encoded bodies
mangopay.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
mangopay.use(cors({ origin: true }));



mangopay.get('/create-user', async (req, res) => {
  try {
    const result = await createUser();
    const code = 200;
    res.status(code).send(`Created mangopay user successfully: ${result}`);
  } catch (e) {
    const code = 500;
    console.log(e);
    res.status(code).send(new Error(`Unable to create mangopay user: ${e}`));
  }
});




exports.mangopay = functions.runWith(runtimeOptions).https.onRequest(mangopay);
