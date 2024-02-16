import browser from "./root/utils/browser-playwright";
import serverVars from "./root/utils/serverVars";
import projectsControllers, {
  type ProjectsControllers,
} from "./projects/projectsControllers";
import dispatcher from "./dispatcher";

export interface InitProps {
  browsers: { stateful: boolean; headless: boolean }[];
}
const init = async ({ browsers }: InitProps) => {
  await browser.init({ instances: [{ stateful: true, headless: false }] });

  await dispatcher(serverVars.drivers[0], {
    action: ((root: ProjectsControllers) => root.home.load).toString(),
    data: {},
    type: "direct",
  });
};

export default init;
