import fs from 'fs';
import Google from '../modules/google.js';
import dotenv from 'dotenv';
dotenv.config();
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
    let mySystem = "3929";
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
  let inputData = [];
  for (let item of await pullData()) {
    inputData[0] = Object.keys(item);
    inputData.push(Object.values(item));
  };
  return inputData;
};

//Script will run function according to title, called out in outline.json
const Demos = {

  nvxDemo: async () => {
    //intro
    console.log(`> lets start with the Puppeteer API, which lets us open Chrome Developer and navigate to a device's web page`);
    console.log(`> we will use that API to open the NVX web page`);
    await delay(2000);

    //open nvx
    let web = new Web();
    await web.NVX();
    await waitForEnter(`> press enter to use that same API to open a Q-Sys touch panel on the web`);
    
    //open qsys
    await web.Qsys();
    console.log(`> watch how Q-Sys control the Crestron NVX's HDMI inputs 1 and 2`);

    // await waitForEnter();
    // console.log(`> notice how one control system (Q-Sys) uses a peripheral from a different system (Crestron) to change HDMI inputs, and to ingest a preview "screen scrape"`);
    
    await waitForEnter(`> there is custom code living in our Q-Sys file, that controls the NVX. Watch how we use Q-Sys' api to pull that code and bring it into our environment:`);
    // console.log();
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
    await waitForEnter(`> press enter `);
    let receivedCode = await NVX.getCode();
    receivedCode ? console.log('successfully pulled code from Q-Sys!') : console.log('something went wrong Patrick, start again');
    await waitForEnter();
    console.log('last, I will show you how I can edit the NVX code and push it back');
    await waitForEnter();
    await NVX.pushCode();
  },

  google: async function (inputData) {
    return await Google.postToGoogle(inputData, 'AVIXA!1:1000');
  },

  reflectDemo: async function () {
    console.log('this function will pull device data from the q-sys reflect api')
    console.log(await pullReflectData());
  },

  slackDemo: async () => {
    console.log('this function will pull that same device data to Slack')
    await Slack.postMsg(await pullReflectData());
  },

  webpageDemo: async () => {
    webpage();
    await waitForEnter();
  },

  shureDemo: async () => {
    let shure = new Shure({ip: "192.168.42.156"});
    await shure.sendCustomString("< SET LED_BRIGHTNESS 0 >")
    console.log(`lets turn the mic lights on`);
    await waitForEnter();
    await shure.sendCustomString("< SET LED_BRIGHTNESS 5 >");
    await waitForEnter();
    console.log('this first demo will mute my Shure microphone');
    console.log(`open a web page at ${shure.ip}/#!/portal/config/coverage`)
    await waitForEnter();
    await shure.sendCustomString(`< SET DEVICE_AUDIO_MUTE ON >`);
    console.log('this next demo will unmute my Shure microphone');
    await waitForEnter();
    await shure.sendCustomString(`< SET DEVICE_AUDIO_MUTE OFF >`);
    console.log('navigate to Q-Sys and do the same');
    await waitForEnter();
    shure.closeConnection();
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
  console.log(`(can everyone see this console ok?)\n`);
  await waitForEnter("Once everyone is ready, press enter and we will get started...");

  fs.readFile("./lib/outline.json", "utf-8", async (err, res) => {
    if (err) throw `ERROR!: ${err}`;
    for (let demo of JSON.parse(res).Steps.Demos) {
      let fn = Demos[demo.Function] || null;
      fn ? await fn() : console.log(`\nno function added!`)
    }
  });
};

const main = async () => {
  //package.json will create a mode variable
  //this function will do different things depending on that variable
  const mode = process.env.mode;
  switch(mode) {
    case "runThroughPrompts":
      playPresentation();
      break;
    case "uploadNVX": //needed this in dev
      uploadNVX();
      break;
    case "testShure": //needed this in dev
      await Demos.shureDemo();
      break;
  } 
}


export default main;