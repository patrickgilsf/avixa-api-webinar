import puppeteer from 'puppeteer';
const nvxIp = "192.168.42.191";
const qsysIp = "192.168.42.148";

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
    await qsysPage.goto(`https://192.168.42.148/uci-viewer/?uci=TP_Demo&file=2.UCI.xml&directory=/designs/current_design/UCIs/`)
  };

  Browser = async () => {
    if (!this.browser) await this.spinUpBrowser();
    let browserPage = await this.browser.newPage();
    await browserPage.goto(`http://localhost:3000`);
  };

  Shure = async () => {
    if (!this.browser) await this.spinUpBrowser();
    let shurePage = await this.browser.newPage();
    await shurePage.goto(`http://192.168.42.156/#!/portal/config/coverage`);
  }

  closeSession = async () => this.browser.close();
};

export default Web;