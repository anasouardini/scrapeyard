import browser from "./root/utils/browser-playwright";
import projectsControllers from "./projects/projectsControllers";
import { BrowserContext } from "playwright";

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

export interface Msg {
  type: "scrapeyardEvent" | "direct";
  action: string;
  data: any;
}

const dispatcher = async (driver: BrowserContext, msg: Msg) => {
  if (!msg.action) {
    console.log(
      "Err -> can't dispatch a msg without a destination/action; This should never happen outside debugging."
    );
  }

  //* the action is wrapped in a function for easier serialization.
  // console.log({action: msg.action});
  const actionMethodWrapped = eval(msg.action)(projectsControllers);
  type ActionMethod =
    | ((driver: BrowserContext, args?: any) => void)
    | ((args?: any) => Promise<any>);
  const actionMethod: ActionMethod = actionMethodWrapped;
  console.log("action: ", msg.action);
  // console.log({ actionMethod });
  // console.log("EVENT: ", msg);
  if (typeof actionMethod == "function") {
    // exec action
    return await actionMethod(driver, msg.data ?? undefined);
  } else {
    console.log("the action doesn't exit");
  }
};

export default dispatcher;
