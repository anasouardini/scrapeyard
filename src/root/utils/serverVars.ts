import { Browser, BrowserContext, Page } from "playwright";
import tools from "./tools";

const drivers: BrowserContext[] = [];
const serverVars = {
  paths: {
    tmp: tools.genAbsolutePath("src/tmp"),
    projectsDir: tools.genAbsolutePath("src/projects"),
    views: {
      srcDir: "ui/views/src",
      buildDir: "ui/views/build",
    },
    rootViewDir: tools.genAbsolutePath("src/root/ui"),
    home: {
      srcDir: "src",
      buildDir: "build",
    },
    viteBuildConfig: tools.genAbsolutePath(
      "src/root/utils/viewBuilder/vite.config.build.ts",
    ),
    buildLog: tools.genAbsolutePath("src/root/data/buildLog.json"),
    viewUtils: tools.genAbsolutePath("src/root/ui/src/viewUtils"),
  },
  drivers,
};

export default serverVars;
