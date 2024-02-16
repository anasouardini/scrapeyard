import init from "./init";
import browser from "./root/utils/browser-playwright";
import serverVars from "./root/utils/serverVars";
import viewsVars from "./root/ui/src/viewUtils/viewsVars";
import viewsBridge from "./root/ui/src/viewUtils/viewsVars";
import * as viewsCommon from "./root/ui/src/viewUtils/common";
export { type ProjectsControllers } from "./projects/projectsControllers";

export default {
  init,
  browser,
  serverVars,
  views: {
    vars: viewsVars,
    bridge: viewsBridge,
    common: viewsCommon,
  },
};

// import scrapeyard, { InitProps, KeyboardOptions } from "scrapeyard";
