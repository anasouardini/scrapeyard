import { BrowserContext, Page } from 'playwright';
import browser from '../utils/browser-playwright';
import serverVars from '../utils/serverVars';
import { type Action } from '../ui/src/viewUtils/common';

const load = async (driver: BrowserContext, actions: Action[]) => {
  // console.log({pages:driver.pages()});
  const tab: Page = driver.pages()[0];
  await browser.injectView(tab, {
    projectName: 'root',
    viewName: 'home',
    data: actions,
  });
};

export default { load };
