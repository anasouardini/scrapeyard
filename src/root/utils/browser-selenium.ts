import chrome from "selenium-webdriver/chrome";
import webdriver from "selenium-webdriver";
import { Builder, Actions, Browser, Key, until, By } from "selenium-webdriver";
import serverVars from "./serverVars";

import tools from "./tools";

import { WebElement } from "@types/selenium-webdriver";

const localVars = { driverRestarting: false };

// const babel = require('@babel/core');
// const stringifyObject = require('util').inspect;
// const tailwindcss = require('tailwindcss');

// type Views = 'common' | 'sendConnection' | 'companyControls' | 'employeesControls' | 'home' | 'sendJobRequests';

const getMessage = async () => {
  if (!isThereInstance()) {
    console.log("browser instance was killed");
    return null;
  }

  let msg = "";
  try {
    await serverVars.driver.wait(
      until.elementLocated(By.css("p#messenger-shared-memory")),
    );
    let messengerElement = await serverVars.driver.findElement(
      By.css("p#messenger-shared-memory"),
    );
    msg = (await messengerElement.getText()) as string;
    console.log({ getTxt: msg });
    try {
      return JSON.parse(msg);
    } catch (e) {
      console.log({ unparsedMsg: msg });
    }
  } catch (e) {
    console.log("browser.js/getMessage ->", e);
    return false;
  }
};

const clearMessage = async () => {
  if (!isThereInstance()) {
    console.log("browser instance was killed");
    return null;
  }

  try {
    await serverVars.driver.wait(
      until.elementLocated(By.css("p#messenger-shared-memory")),
    );
    await serverVars.driver.executeScript(
      `document.querySelector('#messenger-shared-memory').remove()`,
    );
  } catch (e) {
    console.log("browser.js/clearMessage ->");
    console.log(e);
    return false;
  }
};

const init = async () => {
  try {
    let options = new chrome.Options();
    options.addArguments("user-data-dir=/home/venego/.config/chrome/");
    // options.addArguments("user-data-dir=/home/venego/.config/BraveSoftware/Brave-Browser");// doesn't work, idk why
    serverVars.driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  } catch (Err) {
    console.log({ Err });
    return false;
  }
};

const focus = async () => {
  await serverVars.driver.executeScript('alert("Focus window")');
  await serverVars.driver.switchTo().alert().accept();
  await serverVars.driver.executeScript("window.focus()");
  await serverVars.driver.executeScript("window.scrollBy(0, 99999999)");
};

const writeToActiveInput = async (msg: string) => {
  await serverVars.driver.switchTo().activeElement().sendKeys(msg);
};

const newTab = async ({ url }: { url: string }) => {
  await serverVars.driver.switchTo().newWindow("tab");
  await goto({ url });
};

//? add switch by url or title
const switchToWindow = async ({ index }: { index: number }) => {
  const windowHandles = await serverVars.driver.getAllWindowHandles();
  if (!windowHandles?.[index]) {
    console.log(`Err -> window[${index}] doesn't exist`);
    return;
  }
  await serverVars.driver.switchTo().window(windowHandles.at(index));
};

const goto = async ({ url }: { url: string }) => {
  if (!isThereInstance()) {
    console.log("browser instance was killed");
    return null;
  }

  if (!url) {
    console.log("Err -> url is invalid", url);
    return;
  }

  try {
    await serverVars.driver.get(url);
  } catch (Err) {
    console.log({ Err });
  }
};

const findElement = async ({
  query,
  getAll,
  timeout = 1000,
}: {
  query: string;
  getAll?: boolean;
  timeout?: number;
}): Promise<WebElement | WebElement[] | null> => {
  if (!isThereInstance()) {
    console.log("browser instance was killed");
    return null;
  }
  const parentNode = serverVars.driver;

  try {
    await parentNode.wait(until.elementLocated(By.css(query)), timeout);
  } catch (e) {
    console.log(`query: ${query} wasn't successful`);
    return null;
  }

  if (getAll) {
    return await parentNode.findElements(By.css(query));
  }
  return await parentNode.findElement(By.css(query));
};

const mapThroughElements = async ({
  query,
  cb,
}: {
  query: string;
  cb: (element: WebElement) => Promise<any>;
}) => {
  const elements = await findElement({ query, getAll: true });
  if (!elements) {
    console.log(`Err -> no element found with the query: ${query}`);
    return;
  }
  // this should never happen
  if (!Array.isArray(elements)) {
    console.log(`browser/mapThroughElements - Err -> an array was expected`);
    return;
  }

  const output = [];
  for (let i = 0; i < elements.length; i++) {
    output.push(await (async () => cb(elements[i]))());
  }
  return output;
};

const getParent = ({ element }: { element: WebElement }) => {
  return element.findElement(By.xpath(".."));
};

// const parsedJSXCache: Record<string, any> = {};
// const parseView = (
//     { viewName, viewExtension = 'tsx', enableCache = true }:
//         { viewName: Views, viewExtension: 'tsx' | 'ts', enableCache?: boolean }
// ) => {
//     // check cache
//     if (enableCache && parsedJSXCache[viewName]) {
//         return parsedJSXCache[viewName];
//     }

//     const inputFilePath = path.resolve(__dirname, `${viewName}.${viewExtension}`);
//     const configFilePath = path.resolve(__dirname, '../../.babelrc');

//     const transpiledCode = babel.transformSync(
//         fs.readFileSync(inputFilePath, 'utf-8'),
//         {
//             configFile: configFilePath,
//             filename: inputFilePath,
//         }
//     );

//     // console.log(transpiledCode.code.replace('export {};', ''))
//     // transpiledCode.code.split('// dummy babel duplicates this script')[0];

//     let parsedCode = transpiledCode.code.split('// dummy babel duplicates this script')[0]
//     // console.log(parsedCode);

//     // console.log(tailwindcss(parsedCode));

//     if (enableCache) {
//         //? removing the second instance of the script along with a dummy export added at the end
//         parsedJSXCache[viewName] = parsedCode;
//     }

//     return parsedCode;
// }

const exec = async ({ string, args }: { string: string; args?: any[] }) => {
  if (!isThereInstance()) {
    console.log("browser instance was killed");
    return;
  }

  try {
    if (args && Array.isArray(args)) {
      return await serverVars.driver.executeScript(string, ...args);
    }

    return await serverVars.driver.executeScript(string);
  } catch (Err) {
    // console.log(`${injectedVars ? `const vars = ${stringifyObject(injectedVars)}` : ''}`);
    // console.log('------------------- Selenium Injects -------------------');
    // console.log(string);
    // console.log('--------------------------------------------------------');
    console.log({ Err });
  }
};

const isThereInstance = async () => {
  try {
    await serverVars.driver.findElement(By.tagName("body")).getText();
    return { success: true };
  } catch (error) {
    if (localVars.driverRestarting) {
      return { success: true, sleep: 3000 };
    }
    return { success: false };
  }
};

const quit = async () => {
  await serverVars.driver.quit();
};

const restart = async () => {
  localVars.driverRestarting = true;
  await serverVars.driver.quit();
  await init();
  localVars.driverRestarting = false;
};

export default {
  init,
  focus,
  writeToActiveInput,
  restart,
  quit,
  goto,
  newTab,
  switchToWindow,
  exec,
  getMessage,
  clearMessage,
  isThereInstance,
  findElement,
  mapThroughElements,
  getParent,
};
