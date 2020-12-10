import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util';
import { responseExecutor } from '../util/responseExecutor';
import { getPayout, getPayin, getCircleBalance, getCommonBalance } from './backoffice';
import { google } from 'googleapis'
import serviceAccount from '../env/adminsdk-keys.json';
import { env } from '../constants';


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
        'Approval created at',
        'Approval updated at',
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
              cells.push(data[key].proposal.id)
              cells.push(data[key].proposal.fundingRequest.amount/100)
              cells.push(new Date(data[key].proposal.createdAt.toDate()).toDateString())
              cells.push(new Date(data[key].proposal.updatedAt.toDate()).toDateString())
              cells.push(data[key].proposal.proposerId)
              cells.push(data[key].user.email)
              cells.push(data[key].user.firstName)
              cells.push(data[key].user.lastName)
              cells.push(data[key].common.id)
              cells.push(data[key].common.name)
              if(data[key].payment){
                cells.push(data[key].payment.id)
                cells.push(data[key].payment.status)
                cells.push(data[key].payment.amount? `${data[key].payment.amount.amount} ${data[key].payment.amount.currency}` : '' )
                cells.push(data[key].payment.fee/100)
                const creationDate = data[key].payment.creationDate.split(/\D+/)
                const updateDate = data[key].payment.updateDate.split(/\D+/)
                cells.push(new Date(Date.UTC(creationDate[0], --creationDate[1], creationDate[2], creationDate[3], creationDate[4], creationDate[5], creationDate[6])).toDateString())
                cells.push(new Date(Date.UTC(updateDate[0], --updateDate[1], updateDate[2], updateDate[3], updateDate[4], updateDate[5], updateDate[6])).toDateString())
              } else {
                cells.push("")
                cells.push("")
                cells.push("")
                cells.push("")
                cells.push("")
                cells.push("")
              }
              
              values.push(cells)
          }
      }
      const resource = {
        values,
      };

      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: env.backoffice.sheetUrl,
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
        'Funding',
        'Proposal title',
        'Proposal created at',
        'Proposal updated at',
        'User UID',
        'User email',
        'First name',
        'Last name',
        'Common id',
        'Common name',
        'Common information',
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
              cells.push(data[key].proposal.id)
              cells.push(data[key].proposal.join.funding/100)
              cells.push(data[key].proposal.description.title)
              cells.push(new Date(data[key].proposal.createdAt.toDate()).toDateString())
              cells.push(new Date(data[key].proposal.updatedAt.toDate()).toDateString())
              cells.push(data[key].proposal.proposerId)
              cells.push(data[key].user.email)
              cells.push(data[key].user.firstName)
              cells.push(data[key].user.lastName)
              cells.push(data[key].common.id)
              cells.push(data[key].common.name)
              cells.push(data[key].common.metadata.contributionType)

              if(data[key].payment){
                cells.push(data[key].payment.id)
                cells.push(data[key].payment.status)
                cells.push(data[key].payment.amount.amount)
                cells.push(data[key].payment.fee/100)
                const creationDate = data[key].payment.creationDate.split(/\D+/)
                const updateDate = data[key].payment.updateDate.split(/\D+/)
                cells.push(new Date(Date.UTC(creationDate[0], --creationDate[1], creationDate[2], creationDate[3], creationDate[4], creationDate[5], creationDate[6])).toDateString())
                cells.push(new Date(Date.UTC(updateDate[0], --updateDate[1], updateDate[2], updateDate[3], updateDate[4], updateDate[5], updateDate[6])).toDateString())
                
              }
              else{
                cells.push("")
                cells.push("")
                cells.push("")
                cells.push("")
                cells.push("")
                cells.push("")
              }
              
              values.push(cells)
          }
      }
      const resource = {
        values,
      };

      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: env.backoffice.sheetUrl,
          range: 'PAY_IN!A1',  // update this range of cells
          valueInputOption: 'RAW',
          requestBody: resource
      }, {})

      return data;
    }, {
      req,
      res,
      next,
      successMessage: `Fetch PAYIN succesfully!`
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
        'Updated At',
        'Date'
      ]];
      for (const key in data) {
        // eslint-disable-next-line no-prototype-builtins
        if (data.hasOwnProperty(key)) {
          const cells = []
          cells.push(data[key].id)
          cells.push(data[key].name)
          cells.push(data[key].balance/100)
          cells.push(new Date(data[key].updatedAt.toDate()).toDateString())
          cells.push(new Date().toDateString())
          values.push(cells)
        }

      }

      const resource = {
        values,
      };

      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: env.backoffice.sheetUrl,
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
          spreadsheetId: env.backoffice.sheetUrl,
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
  .https.onRequest(commonApp(backofficeRouter, {unauthenticatedRoutes:['/payin', '/payout', '/circlebalance', '/commonbalance']}));