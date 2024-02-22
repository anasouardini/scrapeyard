import { ElementHandle, Locator, Route, chromium } from 'playwright';
import serverVars from './serverVars';
import sharedVars from './globalVars';
import { BrowserContext, Page } from 'playwright';
import dispatcher, { Msg } from '../../dispatcher';
import parseView from './viewParser';
import { uuid } from 'uuidv4';
import { RequestBodyType } from './types';
import tools from './tools';

async function subscribeToResponsePromise<TReturn>(
  tab: Page,
  eventHandler: (response: Response, data: any) => Promise<any>,
): Promise<TReturn> {
  const eventData = {
    interval: 100,
    data: undefined,
  };
  const foundIt = (data: any) => {
    eventData.data = data;
  };

  const eventHandlerWrapper = (response) => eventHandler(response, foundIt);
  subscribeToResponse(tab, {
    eventHandler: eventHandlerWrapper,
  });

  //* listens for the data sat by the eventHandler (which uses foundit to do so)
  while (true) {
    await tools.sleep(eventData.interval);
    if (eventData.data) {
      console.log('clearing event listener...');
      unsubscribeToResponse(tab, {
        eventHandler: eventHandlerWrapper,
      });
      return eventData.data;
    }
  }
}

const subscribeToResponse = (
  tab: Page,
  { eventHandler }: { eventHandler: (request) => void },
) => {
  tab.on('response', eventHandler);
};
const unsubscribeToResponse = (
  tab: Page,
  { eventHandler }: { eventHandler: (request) => void },
) => {
  tab.off('response', eventHandler);
};

const subscribeToRoute = (
  tab: Page,
  {
    urlPattern,
    eventHandler,
  }: { urlPattern: RegExp; eventHandler: (route: Route) => Promise<any> },
) => {
  // console.log("subscribing...", { urlPattern });
  tab.route(urlPattern, eventHandler);
};

const unsubscribeToRoute = async (
  tab: Page,
  {
    urlPattern,
    eventHandler,
  }: { urlPattern: RegExp; eventHandler: (route: Route) => Promise<any> },
) => {
  // console.log("unsubscribing...", { urlPattern });
  tab.unroute(urlPattern, eventHandler);
};

const onLoad = async (
  tab: Page,
  { eventHandler }: { eventHandler: (tab: Page) => void },
) => {
  tab.on('load', eventHandler);
};

const observe = (driver: BrowserContext, tab: Page) => {
  //* old way of receving data/actionEvents from client/view
  // attach observer to listen for scraping events
  // tab.on("console", async (signal) => {
  //   const msg = signal.text();
  //   // console.log({ msg });

  //   // Check signature: Get only logs related to scraping
  //   if (msg.includes("scrapeyardEvent")) {
  //     const parsedMsg: Msg = JSON.parse(msg);
  //     dispatcher(parsedMsg);
  //   }
  // });

  //* new method of receving data/actionsEvents from client/view
  //* intercepting scraping requests.
  // tab.route(/.*/, (route: Route) => {
  //   console.log({ request: route.request().url() });
  // });

  //* just a some code I had to paste in the browser several times
  // (async () => {
  //   const resp = await fetch("https://www.google.com/scrapeyardEvent", {
  //     method: "post",
  //     body: JSON.stringify({
  //       foo: "bar",
  //     }),
  //   }).catch((err) => err);
  //   console.log({ resp, respData: await resp.json() });
  // })();

  Array(6)
    .fill(0)
    .forEach((id) => {
      tab.route(/scrapeyardEvent/g, async (route: Route) => {
        // console.log("intercepted", { id });

        let response: any;

        // const request = {
        //   url: route.request().url(),
        //   header: route.request().headers(),
        //   method: route.request().method(),
        //   body:
        //     route.request().method() == "post"
        //       ? route.request().postData()
        //       : null,
        // };
        // console.log({ request });

        const requestBody = route.request().postData();
        if (!requestBody) {
          console.log(
            'Err -> the intercepted request/event from the client/view has no body',
          );
        } else {
          const parsedRequestBody: RequestBodyType = JSON.parse(requestBody);
          // console.log('figuring out MTU to members count ratio.',{ requestSize: requestBody.length });
          // console.log({ parsedRequestBody });

          switch (parsedRequestBody.eventType) {
            case 'runAction': {
              const parsedMsg: Msg = parsedRequestBody.data as Msg;
              // todo: the controllers should get the new data and return it back through the dispatcher and back to the client using a post response.
              response = await dispatcher(driver, parsedMsg);
              break;
            }
            case 'clientRequestsUpdate': {
              if (
                !parsedRequestBody?.data ||
                typeof parsedRequestBody?.data !== 'object'
              ) {
                console.log(
                  "Err -> data, therefor notificationID was not included in the request's body, or body was not parsed when received/intercepted.",
                );
                break;
              }

              // TODO: send a response with the notifications from queue using the id from the request body.data.notificationID
              break;
            }
            default: {
              console.log(
                `Err -> the intercepted event type "${parsedRequestBody.eventType}" is not supported!`,
              );
            }
          }
        }

        // todo: the controller/action should specify the status and body ({data: ..., prop2: ""})
        // route.continue();
        route.fulfill({
          // headers: {
          //   "Access-Control-Allow-Origin": "*",
          // },
          // json: {},
          status: response?.status ?? 200,
          contentType: 'application/json',
          body: JSON.stringify(response ?? { data: {} }),
        });
        return;
      });
    });
};

const newDriver = async ({
  stateful,
  headless,
}: {
  stateful: boolean;
  headless?: boolean;
}) => {
  const driver = await chromium.launchPersistentContext(
    stateful ? '/home/venego/.config/chromium/' : '',
    {
      channel: 'chrome',
      headless: headless ?? false,
      viewport: null,
      // args: ["--enable-extensions"],
      ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
    },
  );

  // detection evasion
  await driver.addInitScript(
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})",
  );

  // observe the first inevitable first tab :)
  const tab = driver.pages()[0];
  // await tab.goto("https://google.com");
  observe(driver, tab);

  // don't target the driver using .at(-1) after you add it to the list, other potentially ASYNC newDriver() calls might screw the order.
  serverVars.windows.push(driver);

  return driver;
};

const init = async ({
  instances,
}: {
  instances: {
    stateful: boolean;
    headless?: boolean;
  }[];
}) => {
  try {
    for (let i = 0; i < instances.length; i++) {
      await newDriver(instances[i]);
    }
  } catch (Err) {
    console.log({ Err });
    return false;
  }
};

//? I don't think I'll need these ideas — keep them haging for a while
// TODO: can't do SEE, but instead of the current approach, try to use websockets, playwright can intercept those as well.
// TODO: there is an issue on their playwright's github about manipulating web sockets, some workaround were posted there.
//* this will feel like SSE while it's dumber than that.
const sendData = async (tab: Page) => {
  // TODO: push the data to the queue, the queue is map where each notification has it's own key.

  tab.evaluate(() => {
    const scrapeyardEvent = new CustomEvent(sharedVars.eventName, {
      detail: { notificationID: uuid() },
    });
    document.dispatchEvent(scrapeyardEvent);
  });

  // TODO: the request intercepter/handler will then clear the queue for more to come.
};

const newTab = async (
  driver: BrowserContext,
  {
    url,
    name,
    blockImages = false,
    beautyLevel = 5,
  }: {
    url?: string;
    name?: string;
    blockImages?: boolean;
    beautyLevel?: 1 | 2 | 3 | 4 | 5;
  },
) => {
  //? TODO: make tabs globally-acessible.
  //? set pages property in the global vars.

  const tab: Page = await driver.newPage();

  //* block images to load page faster, hopefully!. Only helpful for unattended scraping.
  if (blockImages) {
    await tab.route(/(png|jpeg|svg|ico)$/, (route) => {
      route.abort();
    });
  }

  await tab.route('**/*', (route) => {
    const request = route.request();
    const resourceType = request.resourceType();

    // todo: the argument should be more explicity instead of using magical numbers (e.g {scripts: true, etc})
    //! update beautyLevel's type after updating this list
    let resourceTypesBlackList = [
      //! order matters
      'scripts',
      'stylesheet',
      'font',
      'media',
      'image',
    ];
    resourceTypesBlackList = resourceTypesBlackList.slice(beautyLevel);

    const isResourceBlocked = resourceTypesBlackList.some((blResource) => {
      return blResource == resourceType;
    });

    if (isResourceBlocked) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // await tab.route(/(png|jpeg|svg|ico)/, (route)=>{
  //   console.log('found hash in route')
  // })

  if (url) {
    await tab.goto(url);
  }

  observe(driver, tab);

  return tab;
};

const focusElement = async (tab: Page, { query }: { query: string }) => {
  await tab.locator(query).focus();
};

const click = async () => {};
const clickCenter = async (tab: Page) => {
  // todo: this is not generic enough
  // wait for event listeners to settle in.
  await tools.sleep(1000);

  const viewportSize = await exec(tab, {
    string: `
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    `,
  });
  if (!viewportSize) {
    console.log(
      'Err -> could not get the viewport size in order to click in the middle of the screen.',
    );
    return;
  }
  // Calculate the center coordinates
  const centerX = viewportSize.width / 2;
  const centerY = viewportSize.height / 2;
  // Click on the center of the viewport
  // todo: abstract playwright-specific methods
  await tab.mouse.click(centerX, centerY);
};

const writeToActiveInput = async (tab: Page, msg: string) => {
  await tab.keyboard.insertText(msg);
};

export interface KeyboardOptions {
  action: 'press' | 'up' | 'down' | 'insertText' | 'best';
  keys: string;
}
const keyboard = async function (tab: Page, { action, keys }: KeyboardOptions) {
  await tab.keyboard[action](keys);

  // return {
  //   down: tab.keyboard.down,
  //   up: tab.keyboard.up,
  //   press: tab.keyboard.press,
  //   insertText: tab.keyboard.insertText,
  //   custom: async () => {
  //     // todo: parse keys and evaluate one by one
  //     //* e.g: <C-k>search keyword<CR>
  //     return;
  //   },
  // };
};

const elementAction = async (tab: Page, { query, action }) => {
  await exec(tab, {
    string: `document.querySelector(backEndArgs[0])[backEndArgs[1]]();`,
    backEndArgs: [query, action],
  });
};

const uploadFile = async (
  tab: Page,
  {
    mediaPath,
    uploadInputQuery,
    uploadButtonQuery,
  }: {
    mediaPath: string;
    uploadInputQuery?: string;
    uploadButtonQuery?: string;
  },
) => {
  if (uploadButtonQuery) {
    const fileChooserPromise = tab.waitForEvent('filechooser');
    await exec(tab, {
      string: `document.querySelector("${uploadButtonQuery}").click();`,
    });
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(mediaPath);

    return;
  } else if (uploadInputQuery) {
    await tab.locator(uploadInputQuery).first().setInputFiles(mediaPath);
  }
};

// should've been named "isTabOpen"
const isThereInstance = async (tab: Page) => {
  try {
    await tab.locator('body').textContent();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

const getMessage = async function (tab: Page) {
  if (!isThereInstance(tab)) {
    console.log('tab was closed');
    return null;
  }

  let msg;
  try {
    msg = (await tab
      .locator('p#messenger-shared-memory')
      .textContent({ timeout: 100 })) as string;

    if (msg) {
      console.log({ MSG: msg });
    }
    try {
      return JSON.parse(msg);
    } catch (e) {
      return false;
      // console.log("while parsing json-formated message from DOM", e);
    }
  } catch (e) {
    // console.log("browser.js/getMessage ->", e);
    return false;
  }
};

const clearMessage = async function (tab: Page) {
  if (!isThereInstance(tab)) {
    console.log('tab was closed');
    return null;
  }

  try {
    // clear text content of the messenger/shared-memory
    await tab.evaluate(() => {
      const sharedMemeoryDomElement = document.querySelector(
        'p#messenger-shared-memory',
      );
      if (sharedMemeoryDomElement) {
        sharedMemeoryDomElement.textContent = '';
      }
    });
  } catch (e) {
    console.log('browser.js/clearMessage ->');
    console.log(e);
    return false;
  }
};

const clearDOM = async (tab: Page) => {
  if (!tab) {
    console.log('Err -> the tab passed is not valid');
    return;
  }
  await tab.evaluate(() => {
    const body = document.querySelector('body');
    if (body) {
      body.innerHTML = '';
    }
  });
};

const focusTab = async (tab: Page) => {
  await tab.bringToFront();
};

const goto = async function (tab: Page, { url }: { url: string }) {
  if (!isThereInstance(tab)) {
    console.log('browser instance was killed');
    return null;
  }

  if (!url) {
    console.log('Err -> url is invalid: ', url);
    return;
  }

  // console.log({ url });

  //! can't catch this mf
  try {
    await tab.goto(url);
  } catch (Err) {
    console.log({ Err });
  }
};

const findElement = async function (
  tab: Page,
  {
    query,
    getAll,
    timeout = 1000,
  }: {
    query: string;
    getAll?: boolean;
    timeout?: number;
  },
): Promise<Locator | Locator[] | null> {
  if (!isThereInstance(tab)) {
    console.log('browser instance was killed');
    return null;
  }

  // wait for the element to exist first - Playwright is not without it's quircks!
  try {
    await tab.waitForSelector(query, { timeout });
  } catch (E: any) {
    if (E.toString().match(/timeout/i) == null) {
      // only print the error if it's not the expected Timeout.
      console.log({ E });
    }

    return null;
  }

  //todo: instead of evaluateHandle, use evaluate and return !!element;
  if (getAll) {
    const elements = await tab.locator(query).all();
    if (!elements || !elements.length) {
      console.log(`query: ${query} wasn't successful`);
      return null;
    }

    return elements;
  }

  // todo: find async equivalent to first() instead of all()
  const element = await tab.locator(query).all();
  if (!element || !element[0]) {
    console.log(`query: ${query} wasn't successful`);
    return null;
  }

  return element[0];
};

const mapThroughElements = async function (
  tab: Page,
  {
    query,
    cb,
  }: {
    query: string;
    cb: (element: ElementHandle<HTMLElement | SVGElement>) => Promise<any>;
  },
) {
  const elements = await findElement(tab, { query, getAll: true });

  if (!elements) {
    console.log(`Err -> no element found with the query: ${query}`);
    return;
  }
  // this should never happen
  if (!Array.isArray(elements)) {
    console.log(`browser/mapThroughElements - Err -> an array was expected`);
    return;
  }

  const output: any[] = [];
  for (let i = 0; i < elements.length; i++) {
    // @ts-ignore
    output.push(await (async () => cb(elements[i]))());
  }
  return output;
};

const getParent = (
  tab: Page,
  {
    element,
  }: {
    element: ElementHandle<HTMLElement | SVGElement>;
  },
) => {
  return element.evaluateHandle((element) => {
    return element.parentNode;
  });
};

const injectView = async (
  tab: Page,
  {
    inlineString,
    viewName,
    projectName,
    data,
  }: {
    inlineString?: string;
    viewName?: string;
    projectName?: string;
    data?: Record<string, any>;
  },
): Promise<{ success: boolean; error?: any }> => {
  // console.log({projectName, viewName})

  const parsedView = parseView({
    inlineString,
    projectName,
    viewName,
    data,
  });
  if (parsedView.error || !parsedView.data) {
    // console.log(parsedView.error);
    return { success: false, error: parsedView.error };
  }

  await exec(tab, { string: parsedView.data });
  return { success: true };
};

const exec = async function (
  tab: Page,
  {
    string,
    backEndArgs,
    domElement,
    printError = true,
  }: {
    string: string;
    printError?: boolean;
    backEndArgs?: Record<string, any>;
    domElement?: Locator;
  },
) {
  // TODO: implement this new method of passing vars to views || or use network interception.
  // const serverVarsFunction = () => ({ var1: "" });
  // const stringifiedServerVarsFunction = serverVarsFunction.toString();
  // tab.evaluate((stringifiedServerVarsFunction) => {
  //   const prependedServerVarsStringifiedFunction =
  //     stringifiedServerVarsFunction;

  //   const serverVarsFunction = eval(prependedServerVarsStringifiedFunction);
  //   console.log({
  //     prependedServerVarsStringifiedFunction,
  //     serverVarsFunction,
  //     vars: serverVarsFunction(),
  //   });
  // }, stringifiedServerVarsFunction);

  if (!isThereInstance(tab)) {
    console.log('browser instance was killed');
    return;
  }

  //todo: controllers should not pass element handles as arguments but queries to resolve them in the browser rather.
  try {
    if (domElement) {
      return await domElement.evaluate(
        (domElement, { string, backEndArgs }) => {
          return eval(`(()=>{${string}})()`);
        },
        { string, backEndArgs },
      );
    }

    return await tab.evaluate(
      ({ string, backEndArgs }) => {
        return eval(`(()=>{${string}})()`);
      },
      { string, backEndArgs },
    );

    // console.log("injecting js...");
    // return await tab.evaluate((codeString) => {
    //   return eval(`(()=>{${codeString}})()`);
    // }, string);
  } catch (Err) {
    // console.log(`${injectedVars ? `const vars = ${stringifyObject(injectedVars)}` : ''}`);
    // console.log('------------------- Injecting -------------------');
    // console.log(string);
    // console.log('--------------------------------------------------------');
    if (printError) {
      console.log({ Err });
    }
  }
};

const close = async (tab: Page) => await tab.close();

const quit = async (driver: BrowserContext) => {
  for (const driver of serverVars.windows) {
    driver.close();
  }
};

const restart = async (driver: BrowserContext, tab: Page) => {
  await tab.close();
  return newTab(driver, {});
};

const browserMethods = {
  init,
  newDriver,
  newTab,
  quit,
};
const tabMethods = {
  subscribeToRoute,
  unsubscribeToRoute,
  subscribeToResponsePromise,
  subscribeToResponse,
  unsubscribeToResponse,
  onLoad,
  restart,
  clearDOM,
  sendData,
  focusElement,
  click,
  clickCenter,
  writeToActiveInput,
  keyboard,
  elementAction,
  uploadFile,
  isThereInstance,
  focus: focusTab, //! don't remove this alias unless you're sure about it.
  focusTab,
  goto,
  findElement,
  mapThroughElements,
  getParent,
  injectView,
  exec,
  close,
};

export default { ...browserMethods, ...tabMethods };
