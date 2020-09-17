const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const env = require('@env')

const { arc } = require('../settings')
const { responseExecutor } = require('../util/responseExecutor');
const { createCommon, preCommonCreation } = require('./CreateCommon')
const { preCreateRequestToJoin, createRequestToJoin  } = require('./CreateProposal')
// const { Utils } = require('../util/util');
// Utils.fetchAllContrarcts();

const runtimeOptions = {
  timeoutSeconds: 540, // Maximum time 9 mins
}

const create = express();
create.use(bodyParser.json());
create.use(bodyParser.urlencoded({
  extended: true
}));
create.use(express.json());
create.use(express.urlencoded({ extended: true }));
create.use(cors({ origin: true }));

create.post('/preCommonCreation', async (req, res) => {
  responseExecutor(
    async () => {
      return await preCommonCreation(req, arc);
    },
    {
      req,
      res,
      successMessage: `Pre common creation pass!`,
      errorMessage: `Unable to create a wallet!`
    }
  );
})

create.post('/createCommon', async (req, res) => {
  responseExecutor(
    async () => {
      return await createCommon(req, arc);
    },
    {
      req,
      res,
      successMessage: `Common Created successfully!`,
      errorMessage: `Unable to create a wallet!`
    }
  );
})

create.post('/preCreateRequestToJoin', async (req, res) => {
  responseExecutor(
    async () => {
      return await preCreateRequestToJoin(req);
    },
    {
      req,
      res,
      successMessage: `Pre common creation pass!`,
      errorMessage: `Unable to create a wallet!`
    }
  );
})

create.post('/createRequestToJoin', async (req, res) => {
  responseExecutor(
    async () => {
      return await createRequestToJoin(req);
    },
    {
      req,
      res,
      successMessage: `Common Created successfully!`,
      errorMessage: `Unable to create a wallet!`
    }
  );
})

exports.create = functions.runWith(runtimeOptions).https.onRequest(create);
