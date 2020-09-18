const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { responseExecutor } = require('../util/responseExecutor');
const { createCommon, createCommonTransaction } = require('./Common')
const { createRequestToJoinTransaction, createRequestToJoin  } = require('./RequestToJoin')
const { createVoteProposalTransaction, voteProposal  } = require('./VoteProposal')
const { createFundingProposalTransaction, createFundingProposal } = require('./FundingProposal');
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

create.post('/createCommonTransaction', async (req, res) => {
  responseExecutor(
    async () => {
      return await createCommonTransaction(req);
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
      return await createCommon(req);
    },
    {
      req,
      res,
      successMessage: `Common Created successfully!`,
      errorMessage: `Unable to create a wallet!`
    }
  );
})

create.post('/createRequestToJoinTransaction', async (req, res) => {
  responseExecutor(
    async () => {
      return await createRequestToJoinTransaction(req);
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

  create.post('/createFundingProposalTransaction', async (req, res) => {
    responseExecutor(
      async () => {
        return await createFundingProposalTransaction(req);
      },
      {
        req,
        res,
        successMessage: `Pre common creation pass!`,
        errorMessage: `Unable to create a wallet!`
      }
    );
})
  
  create.post('/createFundingProposal', async (req, res) => {
    responseExecutor(
      async () => {
        return await createFundingProposal(req);
      },
      {
        req,
        res,
        successMessage: `Common Created successfully!`,
        errorMessage: `Unable to create a wallet!`
      }
    );
})

  create.post('/createVoteProposalTransaction', async (req, res) => {
    responseExecutor(
      async () => {
        return await createVoteProposalTransaction(req);
      },
      {
        req,
        res,
        successMessage: `Pre common creation pass!`,
        errorMessage: `Unable to create a wallet!`
      }
    );
  })
  
  create.post('/votePropoal', async (req, res) => {
    responseExecutor(
      async () => {
        return await voteProposal(req);
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