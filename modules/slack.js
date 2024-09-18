/*
this is how I send a Slack message programatically
you need to secrets in your .env file to make it work:
- slackChannel - the channel ID you are posting to
- slackKey - the API key for your Slack app
Last, you need to create the Slack app in the Slack app marketplace!
(reach out if you have questions)
*/
import pkg from '@slack/web-api';
const SlackAPI = pkg.WebClient;

const Slack = {
  postMsg: async (msg) =>{
    let channel = process.env.slackChannel;
    let slack = new SlackAPI(process.env.slackKey);

    try {
      let result = await slack.chat.postMessage({
        channel,
        text: msg
      });
      result.ok ? console.log(`successful messages post at ${new Date(Number(result.ts)).toLocaleString()}`) : console.log('error updating to Slack');
    } catch(e) {console.error(e)};
  }
}

export default Slack;
