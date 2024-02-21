import {
  browser,
  init,
  serverVars,
  dispatcher,
  type ProjectsControllers,
} from "scrapeyard";

// initializes instances/windows
await browser.init({
  instances: [{ stateful: true, headless: false }],
});

// runs a controller from "root.home" and passes it empty object "{}"
await dispatcher(serverVars.drivers[0], {
  action: ((root: ProjectsControllers) => root.home).toString(),
  data: {},
  type: "direct", // direct: directly from the server (this file)
});
