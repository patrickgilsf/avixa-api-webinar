import {google} from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();
// const GoogleKey = process.env.GOOGLEKEY.split(String.raw`\n`).join('\n')
// const GoogleEmail = process.env.GOOGLEEMAIL;

// class Google {

//   constructor ({email = "", key = "", spreadsheetId = ""}) {
//     this.email = email;
//     this.key = key;
//     this.spreadsheetId = spreadsheetId
//   };

  
  
//   auth = async () => {
//     let authOptions = new google.auth.JWT(
//       // process.env.GOOGLEEMAIL,
//       this.email,
//       null,
//       // process.env.GOOGLEKEY.split(String.raw`\n`).join('\n'),
//       this.key.split(String.raw`\n`).join('\n')
//       [
//         "https://www.googleapis.com/auth/spreadsheets"
//       ],
//         null
//     );
//     // // console.log(authOptions);
//     let x = google.options({authOptions});
//     // return authOptions
//     const sheets = google.sheets('v4');
//     return x
//   };

//   postToGoogle = async (inputData, range) => {

//     console.log(await this.auth());
//     // let authCheck = await this.auth();
//     // if (authCheck) return `error! Authentication failed!`;

//     return new Promise((resolve, reject) => {
  
//       this.sheets.spreadsheets.values.update({
//         // spreadsheetId: '1dIMaJFSG2662mbNCjn9B-g2zkAr4DB7etLJPYAnUq7M',
//         spreadsheetId: this.spreadsheetId,
//         range,
//         valueInputOption: 'USER_ENTERED',
//         includeValuesInResponse: false,
//         resource: {
//           values: inputData
//         }
//       }, (err, res) => {
//         !err ? resolve(`Update succeeded with code ${res.status}!`) : err ? reject(err) : null;
//       })
//     })

//   };

// }
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

const getGoogleData = async (range) => {
  try {
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
      }, (err, res) => {
        err ? console.log(err) : resolve(res.data.values);
      })
    })
  } catch(err) {reject(err)}
};

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