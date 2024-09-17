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
    // await qsysPage.goto(`http://${qsysIp}`);
    // await qsysPage.waitForSelector('input[name="username"]');
    // await qsysPage.type('input[name="username"]', process.env.QsysUsername);
    // await qsysPage.type('input[name="password"]', process.env.QsysPassword);
    // await qsysPage.click('button[type="submit"]', {waitUntil: 'domcontentloaded'})
  };

  closeSession = async () => this.browser.close();
};

export default Web;