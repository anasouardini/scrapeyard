import { type ProjectsControllers } from '../../../../projects/projectsControllers';
import bridge from './bridge';
import vars, { type RequestBodyType } from './viewsVars';
import './index.css';

// adding a property by which the server and the view will communicate.
declare global {
  interface Window {
    scrapeyardViewData: any;
  }
}

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

//* new way of getting initial and new data from server.
const listenForServerNotifications = () => {
  //* this custom event will get dispatched by the back-end
  document.addEventListener(vars.eventName, async (e) => {
    interface CustomEvent {
      detail: { notificationID: string };
    }
    //* event name is the route (fake route)

    // @ts-ignore
    const customEvent: CustomEvent = e as CustomEvent;
    const body: RequestBodyType = {
      eventType: 'clientRequestsUpdate',
      data: {
        notificationID: customEvent.detail.notificationID,
      },
    };
    const response = await bridge('post', vars.eventName, body);
    // TODO: new data has to appear in the view (not sure yet how).
  });
};
listenForServerNotifications();

//* old attempt of getting initial and new data from server.
// const getServerVars = () => {
// assuming that the server has prepended a stringified function that returns a variable to the view script.

// let prependedServerVarsStringifiedFunction;
// const serverVarsFunction = eval(prependedServerVarsStringifiedFunction);
// console.log({
//   serverVarsFunction,
// });
// };
// const serverVars = getServerVars();

//* projectsControllers is only used for type-safety in the actions sent to the back-end via browser's consol API.
// @ts-ignore
const projectsControllers: ProjectsControllers = null as ProjectsControllers;

export type Action = (root: ProjectsControllers) => (...arg: any[]) => any;
interface Msg {
  action: Action;
  data: any;
}
// todo: instead of passing both the action and the data, I could just pass a function that wraps the action and call it with the data as an argument; no need to serialize the data for the http request.
const runServerAction = async (msg: Msg) => {
  //* the super uber new method
  const newMsg: RequestBodyType = {
    eventType: 'runAction',
    data: {
      data: msg.data,
      action: msg.action.toString(),
    },
  };

  const response = await bridge('post', vars.eventName, newMsg);
  if (response?.err) {
    console.log({
      Err: 'Err -> Action was not executed on the server.',
      response,
    });
  }
  return response;

  //* the super new method
  // getting object path string after 6 chars: "() => "
  // aka getting the action string
  // interface NewMsg {
  //   action: string;
  //   data: any;
  //   type: "scrapeyardEvent";
  // }
  // const newMsg: NewMsg = {
  //   action: msg.action.toString(),
  //   type: "scrapeyardEvent",
  //   data: msg.data,
  // };
  // console.log(JSON.stringify(newMsg)); // console event is observed by the back-end

  //* The new method
  //   msg.type = "scrapeyardEvent";
  //   const jsonMsg = JSON.stringify(msg);
  //   console.log(jsonMsg);

  //* The old method
  // let sharedMem = {};
  // sharedMem = document.querySelector('p#messenger-shared-memory');
  // if (sharedMem) { sharedMem.remove() }

  // sharedMem = document.createElement('p');
  // sharedMem.setAttribute('id', 'messenger-shared-memory');

  // const jsonMsg = JSON.stringify(msg);

  // sharedMem.innerText = jsonMsg;
  // sharedMem.style.display = 'hidden';

  // console.log({ messengerStringifiedMsg: sharedMem.innerText });
  // document.body.appendChild(sharedMem);
};

//* old way of translating button clicks to valid msg
// const setMessengerListener = () => {
//   document.body.addEventListener("click", (e) => {
//     const el = e.target;
//     if (el.tagName === "BUTTON" && el.dataset.action && el.dataset.data) {
//       console.log("injected button was clicked");
//       const { action, data } = e.target.dataset;

//       // 7 represents the 7 characters: "() => "
//       const actionAsFunction = new Function(action.slice(7)) as () => () => any;
//       messenger({ action: actionAsFunction, data: JSON.parse(data) });
//     }
//   });
// };

const colors = {
  accent: 'rgb(14 144 34)',
};

const globalStyle = {
  btn: {
    cursor: 'pointer',
    background: colors.accent,
    color: 'white',
    'font-size': '1.2rem',
    border: 'none',
    'border-radius': '10px',
    padding: '4px 8px',
    // margin : '10px 0 0 5px',
  },
  btnsContainer: {
    position: 'sticky',
    top: '20px',
    left: '20px',
    'z-index': '99999',
  },
};

export { sleep, runServerAction, globalStyle, colors, projectsControllers };
