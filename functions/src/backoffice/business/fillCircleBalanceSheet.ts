import { backofficeDb } from '../database';
import { getSecret } from '../../settings';
import { env } from '../../constants';
import { google } from 'googleapis'
import { date } from '../helper'


const SERVICE_ACCOUNT = 'SERVICE_ACCOUNT' 
const SERVICE_ACCOUNT_PRIVATE_KEY = 'SERVICE_ACCOUNT_PRIVATE_KEY'

export async function fillCircleBalanceSheet():Promise<any> {
  const sheets = google.sheets('v4')
  const jwtClient = new google.auth.JWT({
      email: await getSecret(SERVICE_ACCOUNT),
      key: await getSecret(SERVICE_ACCOUNT_PRIVATE_KEY),
      scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],  // read and write sheets
  })
  const data = (await backofficeDb.getCircleBalance()).data.data;
  const values = [[
    'Account',
    'Available',
    'Unsettled',
    'Date',
  ]];
  for (let i = 0; i<data.available.length; i++){
    const cells = []
    cells.push(i+1)
    if (data.available[i]) cells.push(parseFloat(data.available[i].amount)); else cells.push(0);
    if (data.unsettled[i]) cells.push(parseFloat(data.unsettled[i].amount)); else cells.push(0);
    cells.push(date())
    values.push(cells)
  }

  const resource = {
    values,
  };

  const jwtAuthPromise = jwtClient.authorize()
  await jwtAuthPromise
  await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId: env.backoffice.sheetUrl,
      range: 'CIRCLE_BALANCES!A1',  // update this range of cells
      valueInputOption: 'USER_ENTERED',
      requestBody: resource
  }, {})

  return data;
}