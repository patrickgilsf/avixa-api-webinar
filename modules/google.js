import {google} from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

//auth workflow
const auth = new google.auth.JWT(
  process.env.GOOGLEEMAIL,
  null,
  process.env.GOOGLEKEY.split(String.raw`\n`).join('\n'),
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
        spreadsheetId: '1dIMaJFSG2662mbNCjn9B-g2zkAr4DB7etLJPYAnUq7M',
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