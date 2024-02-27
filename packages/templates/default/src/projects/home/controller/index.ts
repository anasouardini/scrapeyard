import {
  serverVars,
  browser,
  type BrowserContext,
  type Page,
  type Actions,
} from 'scrapeyard';

const load = async (driver: BrowserContext, actions: Actions) => {
  // console.log({ pages: driver.pages() });
  const tab: Page = driver.pages()[0];
  await browser.injectView(tab, {
    projectName: 'home',
    viewName: 'home',
    data: actions,
  });
};

export default { load };
