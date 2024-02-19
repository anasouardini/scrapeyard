import init from "./init";
import browser from "./root/utils/browser-playwright";
import serverVars from "./root/utils/serverVars";
export { type ProjectsControllers } from "./projects/projectsControllers";

export default {
  init,
  browser,
  serverVars,
};

// import scrapeyard, { InitProps, KeyboardOptions } from "scrapeyard";
