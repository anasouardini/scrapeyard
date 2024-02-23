import {
  browser,
  serverVars,
  dispatcher,
  type ProjectsControllers,
  type Actions,
} from 'scrapeyard';

async function main() {
  // initializes browser instances/windows
  await browser.init({
    instances: [
      // stateful: uses specified profile path
      { stateful: true, headless: false },
      // { stateful: false, headless: true },
    ],
  });

  const actions: Partial<Actions> = {
    frugalads: [
      {
        txt: 'Spread Words',
        action: (root) => root.frugalads.chatiwus.start,
        data: {},
      },
    ],
  };
  // runs a controller from "root.home" and passes it empty object "{}"
  await dispatcher(serverVars.windows[0], {
    action: ((root: ProjectsControllers) => root.home.load).toString(),
    // actions that would be showed in the home view after execution
    data: actions,
    type: 'direct',
    // direct: directly from the server (this file)
    // scrapeyardEvent: from a view in the browser
  });
}

main();
