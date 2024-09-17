import pkg from '@slack/web-api';
const SlackAPI = pkg.WebClient;

const Slack = {
  postMsg: async (msg) =>{
    let channel = process.env.SlackChannel;
    let slack = new SlackAPI(process.env.SlackKey);

    try {
      let result = await slack.chat.postMessage({
        channel,
        text: msg
      });
      // result ? console.log('updated to Slack with success!') : console.log('error updating to Slack');
      result.ok ? console.log(`successful messages post at ${new Date(Number(result.ts)).toLocaleString()}`) : console.log('error updating to Slack');
    } catch(e) {console.error(e)};
  }
}

export default Slack;