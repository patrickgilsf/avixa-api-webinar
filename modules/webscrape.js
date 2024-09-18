/*
this is the script that allowed me to create and open web pages in Google Chrome for Testing, programatically
you need several keys to make it work like the demo
- nvxIp - the IP address of your NVX
- qsysIp - the IP address of your Q-Sys
- qsysTp - the name of the touch panel you are trying to open
- shureIp - the IP address of your Shure microphone
*/
import puppeteer from 'puppeteer';
const nvxIp = process.env.nvxIp;
const qsysIp = process.env.qsysIp;
const qsysTp = process.env.qsysTp;
const shureIp = process.env.shureIp

class Web {
  
  spinUpBrowser = async () => {
    let browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      acceptInsecureCerts: true,
      args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
    });
    this.browser = browser;
    return browser;
  };


  NVX = async () => {
    if (!this.browser) await this.spinUpBrowser();
    let [nvxPage] = await this.browser.pages();
    await nvxPage.goto(`http://${nvxIp}/userlogin.html`);
    await nvxPage.waitForSelector('#cred_userid_inputtext');
    await nvxPage.type('#cred_userid_inputtext', 'admin');
    await nvxPage.type('#cred_password_inputtext', 'admin');
    await nvxPage.click('#credentials > button > span.ui-button-text.ui-c');
  };

  Qsys = async () => {
    if (!this.browser) await this.spinUpBrowser();
    let qsysPage = await this.browser.newPage();
    await qsysPage.goto(`https://${qsysIp}/uci-viewer/?uci=${qsysTp}&file=2.UCI.xml&directory=/designs/current_design/UCIs/`);
  };

  Browser = async () => {
    if (!this.browser) await this.spinUpBrowser();
    let browserPage = await this.browser.newPage();
    await browserPage.goto(`http://localhost:3000`);
  };

  Shure = async () => {
    if (!this.browser) await this.spinUpBrowser();
    let shurePage = await this.browser.newPage();
    await shurePage.goto(`http://${shureIp}/#!/portal/config/coverage`);
  }

  closeSession = async () => this.browser.close();
};

export default Web;
