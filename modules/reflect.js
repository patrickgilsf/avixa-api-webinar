import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const Reflect = {

  //gets data from reflect, agnostic to api call
  getData: async (p) => {
    let betaUrl = "https://staging.reflect.qsc.com/api/public/v0"
    try {
      return new Promise((resolve, reject) => {
        axios.get(`${betaUrl}/${p}`, {headers: {Authorization: `Bearer ${process.env.PW}`}})
        .catch(e => reject(e))
        .then(res => {
          resolve(res.data)
        })
      })
    } catch(e) {console.log(e)}
  }
};

export default Reflect


// //gets all system and peripheral data
// const getAllData = async () => {
//   let rtn = {};
//   let path;

//   //pull systems data
//   path = "systems";
//   for (let system of await getData(path)) {
//     //only pull the systems that are mine
//     if (MySystems.includes(system.name)) {
//       console.log(`\ngetting items for ${system.name}`);
//       // console.log(system);
//       // console.log(system.name)
//       rtn[system.name] = {
//         sysInfo: system,
//         peripherals: []
//       };
//       path = `systems/${system.id}/items`;
//       let sysItems = await getData(path);
//       for (let item of sysItems) {
//         console.log(`> item details for ${item.name}`);
//         rtn[system.name].peripherals.push(item)
//       };
//     }
//   }
//   console.log("\ndone retrieving data!")
//   return rtn;
// }

// //parse data statuses from system data
// const parseData = async () => {
//   //sorting functions
//   let sysOfflineFirst = (a, b) => {
//     let x = a[1].sysInfo.status.code == 5;
//     let y = b[1].sysInfo.status.code == 5;
//     if (x && !y) {
//       return -1
//     } else if (!x && y) {
//       return 1
//     } else return 0
//   };

//   let noIssuesLast = (a,b) => {
//     let x = a[1].sysInfo.status.code == 0;
//     let y = b[1].sysInfo.status.code == 0;
//     if (x && !y) {
//       return 1
//     } else if (!x && y) {
//       return -1
//     } else return 0
//   };


//   //pull data from getAllData()
//   let data = await getAllData()
//   //initiate message
//   let msg = `:qsys:    Here is your daily update of your Q-Sys Inventory:\n\n`;
//   //helper function to add to this message
//   let addMsg = (addition) => {
//     msg = `\n${msg}\n${addition}\n`
//   };

//   //iterate through getAllData() data structure
//   for (let [name, details] of Object.entries(data)
//     .sort((a,b) => sysOfflineFirst(a,b))
//     .sort((a,b) => noIssuesLast(a,b))) {
//     // console.log(details.peripherals)

//     //call out any systems that are fully offline
//     if (details.sysInfo.status.message != "Running") {
//       addMsg(`:rotating_light:Warning!! ${name} is offline!`);
//     //mark healthy systems as good
//     } else if (details.sysInfo.status.code == 0) {
//       addMsg(`:white_check_mark:${name} has no issues`);
//     //capture running systems that have errors
//     } else {
//        addMsg(`:warning: ${name} is having issues:`);
//       //iterate through each system's peripherals
//       for (let peripheral of details.peripherals) {
//         if (peripheral.status.code != 0) {
//           let p = peripheral.status;
//           let obj = {
//             code: p.code,
//             message: p.message,
//             details: p.details == "" ? "no details given" : p.details
//           };
//           //add ip address if it has one
//           peripheral.networkConfig ? obj.ipAddress = peripheral.networkConfig.interfaces[0].ipAddress : null;
//           addMsg(`:point_right:${peripheral.name}: ${JSON.stringify(obj, null, 2).replace(/[\"\{\}]/g, "")}`)
//         }
//       }
//     }

//   };
//   //slack portion
//   const channelID = "C06RY8QARDL";
//   const slack = new Slack(Creds.Slack);
//   //send Slack message
//   try {
//     const result = await slack.chat.postMessage({
//       channel: channelID,
//       text: msg
//     });
//     result ? console.log('updated to Slack with success!') : console.log('error updating to Slack');
//   } catch (e) {console.error(e)};

//   return msg
// }

// // {
// //   Tutorial_Secondary: {
// //     sysInfo: {
// //       id: 4126,
// //       code: '3-8CCC41D052D40EF365C5016075F5648D',
// //       name: 'Tutorial_Secondary',
// //       status: [Object],
// //       design: [Object],
// //       core: [Object]
// //     },
// //     peripherals: [ [Object], [Object], [Object], [Object] ]
// //   },
// //   Tutorial_Main: {
// //     sysInfo: {
// //       id: 4127,
// //       code: '3-D67D5EBAACF7D608C571A6102F152276',
// //       name: 'Tutorial_Main',
// //       status: [Object],
// //       design: [Object],
// //       core: [Object]
// //     },
// //     peripherals: [
// //       [Object], [Object],
// //       [Object], [Object],
// //       [Object], [Object],
// //       [Object], [Object],
// //       [Object], [Object]
// //     ]
// //   }
// // }




// export {
//   getData,
//   getAllData,
//   parseData
// }