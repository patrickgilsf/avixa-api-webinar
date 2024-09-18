/*
this was the build script that let me deploy the NVX code back and forth from the core in the demo
you need a few credentials in your .env file:
- core ip address
- core username, created in Q-Sys Administrator
- core pin, created in the same
*/
import Core from './core.js';
import fs from 'fs';

const core = new Core({
  ip: process.env.qsysCoreIp,
  username: process.env.qsysCoreUsername,
  pin: process.env.qsysCorePin
});

const NVX = {
  getCode: async () => {
    try {
      console.log('>> pulling nvx script from Q-Sys core...');
      const scripts = await core.exportCode();
      return new Promise((resolve, reject) => {
        fs.writeFile('./modules/qNvx.lua', scripts.NVX, (err, res) => {
          err ? reject(err) : resolve(true);
        })
      })
    } catch (e) {
      console.log(`error getting code from q-sys with code:`);
      console.log(e);
    } 

    
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
