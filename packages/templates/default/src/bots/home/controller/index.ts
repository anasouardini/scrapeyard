import {
  serverVars,
  browser,
  type BrowserContext,
  type Page,
  type HomeButtons,
} from 'scrapeyard';

const load = async (driver: BrowserContext, actions: HomeButtons) => {
  // console.log({ pages: driver.pages() });
  const tab: Page = driver.pages()[0];
  await browser.injectView(tab, {
    projectName: 'home',
    viewName: 'home',
    data: actions,
  });
};

export default { load };
