import browser from "./root/utils/browser-playwright";
import serverVars from "./root/utils/serverVars";
import projectsControllers, {
  type ProjectsControllers,
} from "./projects/projectsControllers";
import dispatcher from "./dispatcher";

const init = async () => {
  await browser.init({ instances: [{ stateful: true, headless: false }] });

  await dispatcher(serverVars.drivers[0], {
    action: ((root: ProjectsControllers) => root.home).toString(),
    data: {},
    type: "direct",
  });
};

init();
