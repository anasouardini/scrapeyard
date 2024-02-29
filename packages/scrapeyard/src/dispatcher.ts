import browser from './root/utils/browser-playwright';
import { BrowserContext } from 'playwright';
import serverVars from './root/utils/serverVars';
import {
  type ActionMethod,
  type ActionMethodWrapper,
  type DispatcherMsg,
} from './root/utils/types';

// direct means called from the back-end not from the browser console event
//* old complicated way
// const getAction = (actionString: string) => {
//   const getActionByPath = (
//     parentNode: Record<string, any>,
//     actionsArray: string[]
//   ): ((...args: any) => any) => {
//     const currentNode = parentNode?.[actionsArray[0]];
//     if (!currentNode) {
//       console.log({
//         err: `Err -> getAction - node named ${actionsArray[0]} doesn't exist.`,
//         actionString,
//       });
//       return currentNode;
//     }
//     actionsArray.shift();
//     if (actionsArray.length == 0) {
//       return currentNode;
//     }
//     return getActionByPath(currentNode, actionsArray);
//   };

//   return getActionByPath(projectsControllers, actionString.split("."));
// };

const dispatcher = async (driver: BrowserContext, msg: DispatcherMsg) => {
  console.log({
    msg,
  });
  if (!driver) {
    console.log(
      'Err -> the driver/browser/window passed to the dispatcher was invalid!',
    );
    return;
  }
  if (typeof msg.action !== 'string' && typeof msg.action !== 'function') {
    console.log(
      "Err -> can't dispatch a msg without a destination/action; action should be either a function or a stringified function.",
    );
    return;
  }

  //* the action is wrapped in a function for easier serialization.
  // console.log({action: msg.action});
  // console.log({ controllers: serverVars.controllers });
  const actionMethodWrapped =
    typeof msg.action == 'string'
      ? eval(msg.action)(serverVars.controllers)
      : //todo: TS is confused between ActionMethod and ActionMethodWrapper
        // @ts-ignore
        msg.action(serverVars.controllers);
  const actionMethod: ActionMethod = actionMethodWrapped;
  console.log('action: ', msg.action);
  // console.log({ actionMethod });
  // console.log("EVENT: ", msg);
  if (typeof actionMethod == 'function') {
    // exec action
    return await actionMethod(driver, msg.data ?? undefined);
  } else {
    console.log("the action doesn't exit");
  }
};

export default dispatcher;
