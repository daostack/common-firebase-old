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
      let values = [];

      const data = await getPayout();

      for (var key in data) {
          if (data.hasOwnProperty(key)) {
              let cells = []
              cells.push(key)
              console.log(data[key])
              cells.push(data[key].proposerId)
              cells.push(data[key].id)
              cells.push(data[key].executedAt)
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
          range: 'Test!A2',  // update this range of cells
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