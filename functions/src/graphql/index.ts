import * as functions from 'firebase-functions';

import { updateDAOBalance } from '../db/daoDbService';
import { commonApp, commonRouter } from '../util/commonApp';
import { responseExecutor } from '../util/responseExecutor';

import { updateDaoById, updateDaos } from './dao';
import { updateProposalById, updateProposals } from './proposal';
import { getPublicSettings } from './settings';
import { updateUsers } from './user';
import { updateVotes } from './vote';


const runtimeOptions = {
  timeoutSeconds: 540 // Maximum time 9 mins
};

const graphql = commonRouter();

graphql.get('/update-daos', async (req, res) => {
  responseExecutor(
    async () => {
      return await updateDaos();
    }, {
      req,
      res,
      successMessage: `Updated DAOs successfully!`
    }
  );
});

graphql.get('/update-dao-by-id', async (req, res) => {
  const { daoId, retries } = req.query;
  responseExecutor(
    async () => {
      return await updateDaoById(daoId, { retries: retries || 0 });
    }, {
      req,
      res,
      successMessage: `Updated dao with id ${daoId}!`
    }
  );
});

graphql.get('/update-proposals', async (req, res) => {
  responseExecutor(
    async () => {
      return await updateProposals();
    }, {
      req,
      res,
      successMessage: `Updated proposals!`
    }
  );
});

graphql.get('/update-proposal-by-id', async (req, res) => {
  const { proposalId, retries, blockNumber } = req.query;

  responseExecutor(
    async () => {
      return await updateProposalById(proposalId, { retries: retries || 0 }, blockNumber);
    }, {
      req,
      res,
      successMessage: `Updated proposal ${proposalId}!`
    }
  );
});

graphql.get('/update-users', async (req, res) => {
  responseExecutor(
    async () => {
      return await updateUsers();
    }, {
      req,
      res,
      successMessage: `Updated users successfully!`
    }
  );
});

graphql.get('/update-votes', async (req, res) => {
  responseExecutor(
    async () => {
      return await updateVotes();
    }, {
      req,
      res,
      successMessage: `Updated votes successfully!`
    }
  );
});

graphql.get('/update-dao-balance', async (req, res) => {
  const { daoId } = req.query;

  responseExecutor(
    async () => {
      return await updateDAOBalance(daoId);
    }, {
      req,
      res,
      successMessage: `Updated balance of Common at ${daoId}!`
    }
  );
});

graphql.get('/settings', async (req, res) => {
  await responseExecutor(() => getPublicSettings(req), {
    req,
    res,
    successMessage: 'Setting successfully acquired!'
  });
});

exports.graphql = functions.runWith(runtimeOptions)
  .https.onRequest(commonApp(graphql));
