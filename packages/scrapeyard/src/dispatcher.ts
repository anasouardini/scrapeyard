import browser from './root/utils/browser-playwright';
import { BrowserContext } from 'playwright';
import serverVars from './root/utils/serverVars';
import { ProjectsControllers } from './mainInterface';

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

type ActionMethod = (driver: BrowserContext, args?: any) => void;
export interface Msg {
  type: 'scrapeyardEvent' | 'direct';
  action: string | ((root: ProjectsControllers) => ActionMethod);
  data: any;
}

const dispatcher = async (driver: BrowserContext, msg: Msg) => {
  // console.log({
  //   msg,
  // });
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
  const actionMethodWrapped =
    typeof msg.action == 'string'
      ? eval(msg.action)(serverVars.controllers)
      : msg.action(serverVars.controllers);
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
