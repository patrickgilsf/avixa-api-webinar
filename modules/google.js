/*
This is a simple proof of concept for adding data into the Google APIs
- data must be formatted as one array for each row
- you need to have a setup a service account in GCP, and have the following credentials:
  + svc account email address
  + svc account API key
  + spreadsheet you are trying to update
- last, the service account needs to be given edit access to the sheet
*/

import {google} from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

//auth workflow
const auth = new google.auth.JWT(
  process.env.googleEmail,
  null,
  process.env.googleKey.split(String.raw`\n`).join('\n'),
  [
    "https://www.googleapis.com/auth/spreadsheets"
  ],
    null
  );
google.options({auth});
const sheets = google.sheets('v4');


const Google = {

  postToGoogle: async (inputData, range) => {
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.update({
        spreadsheetId: process.env.googleSpreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: false,
        resource: {
          values: inputData
        }
      }, (err, res) => {
        !err ? resolve(`Update succeeded with code ${res.status}!`) : reject(err);
      })
    })
  }
}


export default Google;
