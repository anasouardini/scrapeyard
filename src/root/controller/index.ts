import { BrowserContext, Page } from "playwright";
import browser from "../utils/browser-playwright";
import serverVars from "../utils/serverVars";

const load = async (driver: BrowserContext) => {
  // console.log({pages:driver.pages()});
  const tab: Page = driver.pages()[0];
  await browser.injectView(tab, {
    projectName: "root",
    viewName: "home",
  });
};

export default { load };
