import {
  browser,
  init,
  serverVars,
  dispatcher,
  type ProjectsControllers,
} from "scrapeyard";
import chatgpt from "./projects/1iqai/controller/chatgpt";

// initializes browser instances/windows
await browser.init({
  instances: [
    // stateful: uses specified profile path
    { stateful: true, headless: false },
    // { stateful: false, headless: true },
  ],
});

// runs a controller from "root.home" and passes it empty object "{}"
await dispatcher(serverVars.drivers[0], {
  action: ((root: ProjectsControllers) => root.home).toString(),
  // actions that would be showed in the home view after execution
  data: {
    oneiqai: [
      {
        txt: "Apple Cake Recipe",
        action: (root) => root.oneiqai.chatgpt.promptTemplate,
        data: { name: "cakeRecipe", args: { type: "apple" } },
      },
    ],
  },
  type: "direct",
  // direct: directly from the server (this file)
  // scrapeyardEvent: from a view in the browser
});

// simple example of using a project.
// "oneiqai" is a default project example at "./projects/oneiqai"
const prompt = "what's the most popular sport in the world?";
const response = await chatgpt.prompt(serverVars.drivers[0], prompt);
console.log({
  prompt,
  response,
});
