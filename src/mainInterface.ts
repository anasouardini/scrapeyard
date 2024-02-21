export { default as init } from "./init";
import browserI from "./root/utils/browser-playwright";
import serverVarsI from "./root/utils/serverVars";
import serverToolsT from "./root/utils/tools";
import dispatcherI from "./dispatcher";
export { type ProjectsControllers } from "./projects/projectsControllers";

// export const init = initI;
export const browser = browserI;
export const serverVars = serverVarsI;
export const serverTools = serverToolsT;
export const dispatcher = dispatcherI;
