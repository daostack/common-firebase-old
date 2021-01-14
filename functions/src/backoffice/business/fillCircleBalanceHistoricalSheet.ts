import { backofficeDb } from '../database';
import { getSecret } from '../../settings';
import { env } from '../../constants';
import { google } from 'googleapis'
import { date } from '../helper'


const SERVICE_ACCOUNT = 'SERVICE_ACCOUNT' 
const SERVICE_ACCOUNT_PRIVATE_KEY = 'SERVICE_ACCOUNT_PRIVATE_KEY'


export async function fillCircleBalanceSheetHistoricalSheet():Promise<any> {
    const data = await backofficeDb.getCircleBalanceHistorical();
      
    const sheets = google.sheets('v4')
    const jwtClient = new google.auth.JWT({
        email: await getSecret(SERVICE_ACCOUNT),
        key: await getSecret(SERVICE_ACCOUNT_PRIVATE_KEY),
        scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],  // read and write sheets
    })
    
    const values = [[
      "Account",
      "Available",
      "Unsettled",
      "Updated at"
    ]];

    for (const key in data) {
        // eslint-disable-next-line no-prototype-builtins
        if (data.hasOwnProperty(key)) {

          for (let i = 0; i<data[key].available.length; i++){
            const cells = []
            cells.push(i+1)
            if (data[key].available[i]) cells.push(parseFloat(data[key].available[i].amount)); else cells.push(0);
            if (data[key].unsettled[i]) cells.push(parseFloat(data[key].unsettled[i].amount)); else cells.push(0);
            cells.push(`${date(new Date(data[key].createdAt.toDate()))}`)
            values.push(cells)
          }
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
        range: 'CIRCLE_BALANCES_HISTORICAL!A1',  // update this range of cells
        valueInputOption: 'USER_ENTERED',
        requestBody: resource
    }, {})
  
    return data;
  }