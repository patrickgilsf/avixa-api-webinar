/*
This is a module that wraps the Q-Sys qrc API in javascript
QRC API https://q-syshelp.qsc.com/Content/External_Control_APIs/QRC/QRC_Commands.htm
*/
import net from 'net';

const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout))

class Core {
  constructor({ip = "", username = "", pin = "", options = {}}) {
    this.ip = ip;
    this.username = username;
    this.pin = pin;
    this.options = options
  }

  //null termination
  __nt = "\u0000"

  //parses return data into workable JSON
  __parsedata = (data) => {
    let rtn = [];
    for (let str of data.split(/\u0000/).filter(Boolean)) {
      try {
        str && JSON.parse(str) ? rtn.push(JSON.parse(str)) : null;
      } catch (e) {
        if (String(e).match(/position (\d+)/)) {
          let pos = Number(String(e).match(/position (\d+)/)[1]);
          console.log("Error at position: ", pos);          
        }
      }
    }
    return rtn;
  }


  __authCheck = async (string, inputClient) => {
    return new Promise((resolve, reject) => {
      let rtn = {}
      inputClient.write(`${JSON.stringify({
        "jsonrpc": "2.0", 
        "method": "StatusGet", 
        "id": 1234,
        "params": 0
      })}${this.__nt}`);
      inputClient.on('data', (d) => {
        string += d;
        if (d.search(this.__nt) !== -1) {
          for (let r of this.__parsedata(string)) {
            if (!r.id) continue;
            if (r.error) {
              rtn.authenticated = false;
            };
            if (r.result) {
              rtn.authenticated = true;
            }
            resolve(rtn);
          };
        };
      })
    });
  };

  __login = async (inputClient) => {
    inputClient.write(`${JSON.stringify({
      "jsonrpc":"2.0",
      "method":"Logon",
      "params":{
        "User": this.username,
        "Password": this.pin
      }
    })}${this.__nt}`);
  }

  //close socket
  closeSocket = () => {
    return this.client.end();
  };

  //main data handler
  sendData = async (data, options = {
    sync: false, 
    send: false, 
    verbose: false
  }) => {
    return new Promise((resolve, reject) => {
      let client = new net.Socket();
      this.client = client;
      let fullString = "";
      client.connect(1710, this.ip, async () => {

        client.setEncoding('utf8');
        client.on('error', (err) => reject(err));

        await this.__login(client);
        let authorized = await this.__authCheck(fullString, client);

        if (!authorized.authenticated) {
          reject(authorized);
        } else {
          client.on('data', async (d) => {

            if (this.options.verbose) console.log(d); 
            fullString += d;

            if (options.sync == false) {
              if (d.search(this.__nt) !== -1) {
                for (let r of this.__parsedata(fullString)) {
                  if (!r.id) continue;
                  // r.result ? resolve(r.result) : r.error ? reject(r.error) : resolve(r);
                  if (r.result) resolve(r.result);
                  if (r.error) reject(r.error);
                }
              }
            } else {
              await timeoutPromise(1000);
              client.end();
              for (let r of this.__parsedata(fullString)) {
                if (r.result) resolve(r.result);
                if (r.error) reject(r.error);
              };
            }
          });
        
          // write data to socket
          client.write(`${JSON.stringify(data)}${this.__nt}`);
        }
      });
    })
  }

  //get a single component's parameters
  getComponent = async (comp, ctl, opt = {}) => {
    return await this.sendData({
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.Get",
      "params": {
        "Name": comp,
        "Controls": [
          {"Name": ctl}
        ]
      }
    }, {verbose: opt.verbose})
  };

  //syncified
  getComponentSync = async (comp, ctl, opt = {}) => {
    return await this.sendData({
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.Get",
      "params": {
        "Name": comp,
        "Controls": [
          {"Name": ctl}
        ]
      }
    }, {verbose: opt.verbose, sync: true})
  }

  //get all components, close socket
  getComponents = async (opt = {}) => {
    return await this.sendData({
      "jsonrpc": "2.0",
      "method": "Component.GetComponents", 
      "params": "test",
      "id": 1234
    }, {verbose: this.options.verbose, sync: false})
  };

  //syncfied
  getComponentsSync = async () => {
    return await this.sendData({
      "jsonrpc": "2.0",
      "method": "Component.GetComponents", 
      "params": "test",
      "id": 1234
    }, {verbose: this.options.verbose, sync: true})
  };

  //get controls from a given component name
  getControls = async (comp, opt = {}) => {
    
    return await this.sendData({
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.GetControls",
      "params": {
          "Name": comp
      }
    }, {verbose: opt.verbose})
  };

  //syncified
  getControlsSync = async (comp) => {
    return await this.sendData({
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.GetControls",
      "params": {
          "Name": comp
      }
    }, {verbose: opt.verbose, sync: true})
  };

  //change a control's value, keep the socket open
  setControl = async (comp, ctl, value, options = {}) => {
    let obj = {
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.Set",
      "params": {
        "Name": comp,
        "Controls": [
          {
            "Name": ctl,
            "Value": value
          }
        ]
      }
    };
    options.ramp ? obj.params.Controls[0].Ramp = options.ramp : null;
    return await this.sendData(obj, {verbose: options.verbose});
  };

  //syncified
  setControlSync = async (comp, ctl, value, options = {}) => {
    let obj = {
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.Set",
      "params": {
        "Name": comp,
        "Controls": [
          {
            "Name": ctl,
            "Value": value
          }
        ]
      }
    };
    options.ramp ? obj.params.Controls[0].Ramp = options.ramp : null;
    return await this.sendData(obj, {verbose: options.verbose, sync: true});
  };

  //channge multiple controls, socket open
  setControls = async (comp, ctls, options) => {
    let obj = {
      "jsonrpc": "2.0",
      "id": 1234,
      "method": "Component.Set",
      "params": {
        "Name": comp,
        "Controls": ctls
      }
    };
    return await this.sendData(obj);
  }

  //return code, or export to folder
  exportCode = async (opt = {}) => {
    //pull data, write to file or return in body
    const components = await this.getComponents();
    let rtn = {};
    for (let cmp of components) {
      if (cmp.Type == "device_controller_script") {
        let ctrls = await this.getControls(cmp.ID);
        for (let ctrl of ctrls.Controls) {
          if (ctrl.Name == "code") rtn[cmp.Name] = ctrl.String;
        }
      }
    };
    return rtn
  };
  //end
};  

export default Core;
