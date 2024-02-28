// export { default as init } from "./init";
import browserI from './root/utils/browser-playwright';
import serverVarsI from './root/utils/serverVars';
import serverToolsT from './root/utils/tools';
export { type RequestBodyType } from './root/utils/types';
import dispatcherI from './dispatcher';
export {
  type Route,
  type Browser,
  type BrowserContext,
  type Page,
} from 'playwright';

// export const init = initI;
export const browser = browserI;
export const serverVars = serverVarsI;
export const serverTools = serverToolsT;
export const dispatcher = dispatcherI;
