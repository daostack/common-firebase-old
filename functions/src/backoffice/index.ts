import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util';
import { responseExecutor } from '../util/responseExecutor';
import { getPayout, getPayin, getCircleBalance, getCommonBalance } from './backoffice';
import { google } from 'googleapis'
import serviceAccount from '../env/adminsdk-keys.json';


const sheets = google.sheets('v4')
const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],  // read and write sheets
})
const jwtAuthPromise = jwtClient.authorize()


const runtimeOptions = {
  timeoutSeconds: 540 // Maximum time 9 mins
};

const backofficeRouter = commonRouter();

backofficeRouter.get('/payout', async (req, res, next) => {
  await responseExecutor(
    async () => {
      const values = [[
        'Proposal Id',
        'Amount',
        'Approval data',
        'User UID',
        'User email',
        'First name',
        'Last name',
        'Common id',
        'Common name',
        'Payment id',
        'Payment status',
        'Payment amount',
        'Fees',
        'Payment creation date',
        'Payment updated'
      ]];

      const data = await getPayout();

      for (const key in data) {
          // eslint-disable-next-line no-prototype-builtins
          if (data.hasOwnProperty(key)) {
              const cells = []
              cells.push(data[key].proposalId)
              cells.push(data[key].fundingRequest.amount/100)
              cells.push(data[key].resolvedAt)
              cells.push(data[key].proposerId)
              cells.push(data[key].email)
              cells.push(data[key].firstName)
              cells.push(data[key].lastName)
              cells.push(data[key].daoId)
              cells.push(data[key].name)
              cells.push(data[key].paymentId)
              cells.push(data[key].status)
              cells.push(data[key].amount? `${data[key].amount.amount} ${data[key].amount.currency}` : '' )
              cells.push('fees')
              cells.push(data[key].creationDate)
              cells.push(data[key].updateDate)
              values.push(cells)
          }
      }
      const resource = {
        values,
      };

      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: '1muC-dGhS_MOEZYKSTNyMthG1NHlo8-4mlb_K5ExD7QM',
          range: 'PAY_OUT!A1',  // update this range of cells
          valueInputOption: 'RAW',
          requestBody: resource
      }, {})

      return data;
    }, {
      req,
      res,
      next,
      successMessage: `Fetch PAYOUT succesfully!`
    }
  );
});

backofficeRouter.get('/payin', async (req, res, next) => {
  await responseExecutor(
    async () => {
      const values = [[
        'Proposal Id',
        'Amount',
        'Proposal data',
        'User UID',
        'User email',
        'First name',
        'Last name',
        'Common id',
        'Common name',
        'Payment id',
        'Payment status',
        'Payment amount',
        'Fees',
        'Payment creation date',
        'Payment updated'
      ]];

      const data = await getPayin();

      for (const key in data) {
          // eslint-disable-next-line no-prototype-builtins
          if (data.hasOwnProperty(key)) {
              const cells = []
              cells.push(data[key].proposalId)
              cells.push(data[key].join.funding/100)
              cells.push(data[key].resolvedAt)
              cells.push(data[key].proposerId)
              cells.push(data[key].email)
              cells.push(data[key].firstName)
              cells.push(data[key].lastName)
              cells.push(data[key].daoId)
              cells.push(data[key].name)
              cells.push(data[key].paymentId)
              cells.push(data[key].status)
              if(data[key].amount) cells.push(data[key].amount.amount)
              else cells.push('')
              if(data[key].fee) cells.push(data[key].fee/100)
              else cells.push('')
              cells.push(data[key].creationDate)
              cells.push(data[key].updateDate)
              values.push(cells)
          }
      }
      const resource = {
        values,
      };

      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: '1muC-dGhS_MOEZYKSTNyMthG1NHlo8-4mlb_K5ExD7QM',
          range: 'PAY_IN!A1',  // update this range of cells
          valueInputOption: 'RAW',
          requestBody: resource
      }, {})

      return data;
    }, {
      req,
      res,
      next,
      successMessage: `Fetch PAYOUT succesfully!`
    }
  );
});

backofficeRouter.get('/commonbalance', async (req, res, next) => {
  await responseExecutor(
    async () => {
      
      const data = await getCommonBalance();
      const values = [[
        'Common id',
        'Common name',
        'Balance',
        'Date'
      ]];
      for (const key in data) {
        // eslint-disable-next-line no-prototype-builtins
        if (data.hasOwnProperty(key)) {
          const cells = []
          cells.push(data[key].id)
          cells.push(data[key].name)
          cells.push(data[key].balance/100)
          cells.push(data[key].updatedAt._seconds+' '+data[key].updatedAt._nanoseconds)
          values.push(cells)
        }

      }

      const resource = {
        values,
      };

      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: '1muC-dGhS_MOEZYKSTNyMthG1NHlo8-4mlb_K5ExD7QM',
          range: 'COMMON_BALANCES!A1',  // update this range of cells
          valueInputOption: 'RAW',
          requestBody: resource
      }, {})

      return data;
    }, {
      req,
      res,
      next,
      successMessage: `Fetch BALANCE succesfully!`
    }
  );
});

backofficeRouter.get('/circlebalance', async (req, res, next) => {
  await responseExecutor(
    async () => {
      
      const data = await getCircleBalance();
      const values = [[
        'Account',
        'Available',
        'Unsettled',
      ]];
      for (let i = 0; i<data.available.length; i++){
        const cells = []
        cells.push(i+1)
        if (data.available[i]) cells.push(parseFloat(data.available[i].amount)); else cells.push(0);
        if (data.unsettled[i]) cells.push(parseFloat(data.unsettled[i].amount)); else cells.push(0);
        values.push(cells)
      }

      const resource = {
        values,
      };


      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: '1muC-dGhS_MOEZYKSTNyMthG1NHlo8-4mlb_K5ExD7QM',
          range: 'CIRCLE_BALANCES!A1',  // update this range of cells
          valueInputOption: 'RAW',
          requestBody: resource
      }, {})

      return data;
    }, {
      req,
      res,
      next,
      successMessage: `Fetch BALANCE succesfully!`
    }
  );
});

export const backofficeApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(backofficeRouter));