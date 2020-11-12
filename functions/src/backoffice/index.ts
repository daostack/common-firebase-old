import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util/commonApp';
import { responseExecutor } from '../util/responseExecutor';
import { getPayout } from './backoffice';
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
      let values = [[
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

      for (var key in data) {
          if (data.hasOwnProperty(key)) {
              let cells = []
              cells.push(data[key].id)
              cells.push(data[key].fundingRequest.amount)
              cells.push(data[key].resolvedAt)
              cells.push(data[key].proposerId)
              cells.push(data[key].email)
              cells.push(data[key].firstName)
              cells.push(data[key].lastName)
              cells.push('common id')
              cells.push('common name')
              cells.push('payment id')
              cells.push('payment status')
              cells.push('payment amount')
              cells.push('fees')
              cells.push('payment creation date')
              cells.push('payment updated')
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
          range: 'Test!A1',  // update this range of cells
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

export const backofficeApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(backofficeRouter));