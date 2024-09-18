/*
this is the script that I used to pull all of my Q-Sys Reflect Data
you need to add the api key in your .env file:
reflectPW="" //your api key
NOTE: I am using the beta URL for reflect, you should probably use the main one
*/
import axios from 'axios';

const Reflect = {

  //gets data from reflect, agnostic to api call
  getData: async (p) => {
    let betaUrl = "https://staging.reflect.qsc.com/api/public/v0"
    try {
      return new Promise((resolve, reject) => {
        axios.get(`${betaUrl}/${p}`, {headers: {Authorization: `Bearer ${process.env.reflectPW}`}})
        .catch(e => reject(e))
        .then(res => {
          resolve(res.data)
        })
      })
    } catch(e) {console.log(e)}
  }
};

export default Reflect
