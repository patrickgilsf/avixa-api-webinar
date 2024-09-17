import Core from './core.js';
import fs from 'fs';

const core = new Core({
  ip: "192.168.42.148",
  username: "QDSP",
  pin: "9283"
});

const NVX = {
  getCode: async () => {
    console.log('pulling nvx script from Q-Sys core');
    const scripts = await core.exportCode();
    return new Promise((resolve, reject) => {
      fs.writeFile('./modules/qNvx.lua', scripts.NVX, (err, res) => {
        err ? reject(err) : resolve(true);
      })
    })
    
  },

  pushCode: async () => {
    let script = fs.readFileSync("./modules/qNvx.lua", {encoding: "utf8"});
    try {
      await core.setControlSync("NVX", "code", script);
    } catch (e) {
      console.log(e);
    }
  }
}


export default NVX;