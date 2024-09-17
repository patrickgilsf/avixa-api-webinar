import Core from '../modules/core.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
// const baseUrl = '/Users/patrickgilligan/Documents/Dev/Online Tutorials/AVIXA_Power-of-APIs/public/';

const app = express();
// app.use(express.static(baseUrl))
app.use(express.static(__dirname + '/'));


const core = new Core({
  ip: "192.168.42.148",
  username: "QDSP",
  pin: "9283"
});

app.get("/", (req, res) => {
  // res.sendFile(`${baseUrl}index.html`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/tests", (req,res) => {
  res.send("Did this work?")
});

app.get("/getComponents", async (req, res) => {
  try {
    let get = await core.getComponentsSync();
    return (get);
  } catch (e) {
    console.log(e);
  }
});

app.get("/nvx1", async (res) => {
  console.log('route 1 hit');
  try {
    let routePassed = await core.setControlSync("NVX", "SetRouteFromWeb", "1");
    return ({
      result: routePassed
    })
  } catch(e) {
    console.log(e);
  }

})
app.get("/nvx2", async (req, res) => {
  console.log('route 2 hit');
  try {
    let routePassed = await core.setControlSync("NVX", "SetRouteFromWeb", "2");
    res.json({
      result: routePassed
    })
  } catch(e) {
    console.log(e);
  }
})

const port = process.env.port || 3000;

const main = () => {
  app.listen(port, () => {
    console.log(`navigate to webpage at http://localhost:${port} to see Q-Sys Web page demo`);
  });
}


export default main;