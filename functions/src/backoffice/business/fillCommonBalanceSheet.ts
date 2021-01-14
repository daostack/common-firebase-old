import { backofficeDb } from '../database';
import { getSecret } from '../../settings';
import { env } from '../../constants';
import { google } from 'googleapis'
import { date } from '../helper'


const SERVICE_ACCOUNT = 'SERVICE_ACCOUNT' 
const SERVICE_ACCOUNT_PRIVATE_KEY = 'SERVICE_ACCOUNT_PRIVATE_KEY'


export async function fillCommonBalanceSheet():Promise<any> {
  const sheets = google.sheets('v4')
      const jwtClient = new google.auth.JWT({
          email: await getSecret(SERVICE_ACCOUNT),
          key: await getSecret(SERVICE_ACCOUNT_PRIVATE_KEY),
          scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],  // read and write sheets
      })

      const data = await backofficeDb.getCommonBalance();
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
          cells.push(date())
          values.push(cells)
        }

      }

      const resource = {
        values,
      };

      const jwtAuthPromise = jwtClient.authorize()
      await jwtAuthPromise
      await sheets.spreadsheets.values.update({
          auth: jwtClient,
          spreadsheetId: env.backoffice.sheetUrl,
          range: 'COMMON_BALANCES!A1',  // update this range of cells
          valueInputOption: 'USER_ENTERED',
          requestBody: resource
      }, {})

      return data;
}