/*
The main bulk of the programming for the demo came from this script!
you can run a script directly with node <folder>/<script>.js, or you can use npm start <script>, along with package.json, in the "scripts" section
this would be fun project to reverse engineer!
a couple of API credentials are needed to use finish:
- mySystem - the name of the system we are filtering for in Reflect
- shureIp - the ip address of the shure microphone
*/

//this will handle your api keys, secrets, and non-agnostic data
import dotenv from 'dotenv';
dotenv.config();
//modules imports
import fs from 'fs';
import Google from '../modules/google.js';
import Reflect from '../modules/reflect.js';
import Slack from '../modules/slack.js';
import NVX from '../modules/qNVX.js';
import readline from 'readline';
import webpage from '../public/webpage.js';
import Shure from '../modules/shure.js';
import Web from '../modules/webscrape.js';

//adds enter prompt, which makes for a fun presentation
const waitForEnter = (customText) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(customText || '\nPress Enter to continue...', () => {
      rl.close();
      resolve();
    });
  });
};

//adds a delay when needed, waiting for async API calls
const delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

//pulls data from my Q-Sys Reflect instance
const pullReflectData = async () =>  {
  const pullData = async () => {
    let rtn = [];
    let mySystem = process.env.mySystem;
    for (const system of await Reflect.getData("systems")) {
      if (system.name != mySystem) continue;
      for (const peripheral of await Reflect.getData(`systems/${system.id}/items`)) {
        let s = peripheral.status;
        let obj = {
          Name: peripheral.name,
          ["Status Code"]: s.code,
          ["Status Message"]: s.message,
        };
        s.details ? obj["Status Details"] = s.details : null;
        rtn.push(obj);
      }
    };
    return rtn;
  };
  let googleData = [];
  let pulledData = await pullData();
  for (let item of pulledData) {
    googleData[0] = Object.keys(item);
    googleData.push(Object.values(item));
  };
  pulledData.unshift({dateUpdated: new Date().toLocaleString()})
  return {
    slack: JSON.stringify(pulledData, null, 2).replace(/[\{\}\[\]\'\"]/g, ""),//will make for better formatting
    google:googleData
  }
};
const web = new Web();
let reflect = await pullReflectData();
//Script will run function according to title, called out in outline.json
const Demos = {
  nvxDemo: async () => {
    //intro
    console.log(`> lets start with the Puppeteer API, which lets us open Chrome Developer and navigate to a device's web page`);
    console.log(`> we will use that API to open the NVX web page`);
    await delay(2000);

    //open nvx
    
    await web.NVX();
    await waitForEnter(`> press enter to use that same API to open a Q-Sys touch panel on the web`);
    
    //open qsys
    await web.Qsys();
    console.log(`> watch how Q-Sys control the Crestron NVX's HDMI inputs 1 and 2`);
    await waitForEnter('> press enter to continue, after you have changed HDMI inputs on Crestron from Q-Sys');

    //pull nvx script, add to local 
    console.clear();
    await waitForEnter(`> now lets introduce a new API. The last NVX demo demonstrated some custom code living in our Q-Sys file. Watch how we use Q-Sys' api to pull that code and bring it into our environment.\n Press enter to delete the old code:`);
    try {
      let path = './modules/qNvx.lua'
      if (fs.existsSync(path)) {
        fs.unlink(path, (err, res) => {
          err ? console.log(err) : console.log(`${path} was already there, so we delete it before we pulled the new one`);
        })
      }
    } catch(e) {
      console.log(e)
    };
    await delay(1000);
    await waitForEnter(`>> press enter to pull the code and add it to our /modules folder`);
    let receivedCode = await NVX.getCode();
    receivedCode ? console.log('>> successfully pulled code from Q-Sys!') : console.log('something went wrong Patrick, start again');
    await waitForEnter('> Next, I will show you how I can edit the NVX code and push it back. Edit code then press enter to update it');
    await NVX.pushCode();
    await delay(3000);
    await waitForEnter(`> check the Q-Sys file and see if the code has been updated`);
    await waitForEnter(`> press enter to move on to next demo...`);
  },

  webpageDemo: async () => {
    console.clear();
    await waitForEnter(`Our next demo will move away from the Q-Sys touch panel, and use a web page we created to control the NVX`);
    webpage();
    await delay(2000);
    await waitForEnter(`\n> press enter to spin up a new browser tab for our custom web page`);
    await web.Browser();
    await waitForEnter(`>> try routing the NVX on the web page\nlook out for feedback in the console that tells we have routed successfully\n`);
    await waitForEnter(`\n>> press enter to move on to the next demo...\n`);
  },

  shureDemo: async () => {
    console.clear();
    await waitForEnter(`Our next demo will control a Shure mic from my computer`);
    let shure = new Shure({ip: process.env.shureIp});
    await waitForEnter(`> press enter to open a web page for the Shure mic`);
    await web.Shure();
    await waitForEnter(`> press enter to turn the mic LEDs off`)
    await shure.sendCustomString("< SET LED_BRIGHTNESS 0 >")
    await waitForEnter(`> press enter to turn the mic leds back on`);
    await shure.sendCustomString("< SET LED_BRIGHTNESS 5 >");
    await waitForEnter(`> press enter to mute the mic`);
    await shure.sendCustomString(`< SET DEVICE_AUDIO_MUTE ON >`);
    await waitForEnter(`> press enter to UNmute the mic`);
    await shure.sendCustomString(`< SET DEVICE_AUDIO_MUTE OFF >`);
    await waitForEnter(`> you can also control the Shure mic from Q-Sys. Demonstrate and press enter to continue`);
    await waitForEnter(`> take note of all the APIs communicating:
    >>Shure mic data provides an API to communicate with its Webpage
    >>Shure mic controlled from my computer terminal, via API and NodeJS
    >>Shure mic controlled from Q-Sys, via API and Q-Sys control`);
    await waitForEnter(`And make sure you left that mic unmuted for the rest of the webinar!`);
    await web.closeSession();
  },

  reflectDemo: async function () {
    console.clear();
    await waitForEnter(`> lets move on to remote monitoring.\nPress enter to pull api data from Q-Sys' Reflect API and log it to the console...`);
    console.log(reflect);
    await waitForEnter(`> notice we the data we have gathered from the Reflect API. You can see all of the devices in my file, as well as their statuses. Press enter to continue`)
  },

  slackDemo: async () => {
    console.clear();
    console.log(`open Slack`);
    await waitForEnter(`> press enter to upload our reflect data to Slack`);
    await Slack.postMsg(await reflect.slack);
    await waitForEnter();
  },

  googleDemo: async function () {
    console.clear();
    await waitForEnter(`Lets move on to the Google Sheets API.Open a browser and navigate to https://docs.google.com/spreadsheets/d/1dIMaJFSG2662mbNCjn9B-g2zkAr4DB7etLJPYAnUq7M/edit?gid=0#gid=0`);
    await waitForEnter(`watch us upload this sheet with our data from Reflect`);
    let success = await Google.postToGoogle(reflect.google, 'AVIXA!1:1000');
    console.log(success);
    success ? console.log(`Google Sheet succesfully updated!`) : console.log(`error uploading to google sheet!`)
  }

};

const uploadNVX = async () => {
  console.log('this function will control nvx from Q-Sys');
  await NVX.pushCode();
}


const playPresentation = async () => {

  await delay(1000);
  console.clear(); //this will clear all warnings and headers from nodeJS before demonstration

  console.log(`Now, I'm going to show you a live demo of several APIs working together:`);
  console.log(`> This application can be cloned at https://github.com/patrickgilsf/avixa-api-webinar`);
  console.log(`(can everyone see this console ok?)\n`);
  await waitForEnter("> Once everyone is ready, press enter and we will get started...");

  fs.readFile("./lib/outline.json", "utf-8", async (err, res) => {
    if (err) throw `ERROR!: ${err}`;
    for (let demo of JSON.parse(res).Steps.Demos) {
      let fn = Demos[demo.Function] || null;
      fn ? await fn() : console.log(`\nno function added!`)
    };
    await waitForEnter(`> this concludes our tech demo. Any questions? press ctl+c when complete`);
  });
};

const startFrom = async (from) => {
  let found = false;
  await delay(1000);
  console.clear();
  console.log(`starting from ${from}`)
  fs.readFile("./lib/outline.json", "utf-8", async (err, res) => {
    if (err) throw `ERROR!: ${err}`;
    for (let demo of JSON.parse(res).Steps.Demos) {
      let fn = Demos[demo.Function] || null;
      console.log(demo.Function == from);
      if (demo.Function == from) found = true;
      if (!found) continue
      fn ? await fn() : console.log(`\nno function added!`)
    };
    await waitForEnter(`> this concludes our tech demo. Any questions? press ctl+c when complete`);
  });
}
const main = async () => {
  //package.json will create a mode variable
  //this function will do different things depending on that variable
  const mode = process.env.mode;
  switch(mode) {
    case "playPresentation":
      playPresentation();
      break;
    case "uploadNVX": //needed this in dev
      uploadNVX();
      break;
    case "testShure": //needed this in dev
      await Demos.shureDemo();
      break;
    case "startFrom":
      await startFrom(process.env.from);
      break;
  } 
}


export default main;
