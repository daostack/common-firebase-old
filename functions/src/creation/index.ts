import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util/commonApp';
import { responseCreateExecutor, responseExecutor } from '../util/responseExecutor';
import { createCommon, createCommonTransaction } from './common';
import { createFundingProposal, createFundingProposalTransaction } from './fundingProposal';
import { createRequestToJoin, createRequestToJoinTransaction } from './requestToJoin';
import { createVoteProposalTransaction, voteProposal } from './voteProposal';


const runtimeOptions = {
  timeoutSeconds: 540, // Maximum time 9 mins
}

const router = commonRouter();

router.post('/createCommonTransaction', async (req, res) => {
  await responseCreateExecutor(
    async () => {
      return await createCommonTransaction(req)
    },
    {
      req,
      res,
      successMessage: `Create common transaction successfully!`
    }
  );
})

router.post('/createCommon', async (req, res) => {
  await responseExecutor(
    async () => {
      return await createCommon(req);
    },
    {
      req,
      res,
      successMessage: `Common Created successfully!`,
    }
  );
})

router.post('/createRequestToJoinTransaction', async (req, res) => {
  await responseCreateExecutor(
    async () => {
      return await createRequestToJoinTransaction(req);
    },
    {
      req,
      res,
      successMessage: `Create requestToJoin transaction successfully!`,
    }
  );
})

router.post('/createRequestToJoin', async (req, res) => {
  await responseExecutor(
    async () => {
      return await createRequestToJoin(req);
    },
    {
      req,
      res,
      successMessage: `Request to join successfully!`,
    }
  );
})

  router.post('/createFundingProposalTransaction', async (req, res) => {
    await responseCreateExecutor(
      async () => {
        return await createFundingProposalTransaction(req);
      },
      {
        req,
        res,
        successMessage: `Create funding proposal transaction successfully!!`,
      }
    );
})
  
  router.post('/createFundingProposal', async (req, res) => {
    await responseExecutor(
      async () => {
        return await createFundingProposal(req);
      },
      {
        req,
        res,
        successMessage: `Create funding proposal successfully!`,
      }
    );
})

  router.post('/createVoteProposalTransaction', async (req, res) => {
    await responseCreateExecutor(
      async () => {
        return await createVoteProposalTransaction(req);
      },
      {
        req,
        res,
        successMessage: `Create a vote proposal transaction successfully!`,
      }
    );
  })
  
  router.post('/votePropoal', async (req, res) => {
    await responseExecutor(
      async () => {
        return await voteProposal(req);
      },
      {
        req,
        res,
        successMessage: `Vote for the proposal successfully!`,
      }
    );
  })

export const create = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(router));