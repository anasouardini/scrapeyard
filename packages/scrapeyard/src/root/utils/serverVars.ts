import { BrowserContext, Page } from 'playwright';
import tools from './tools';

const windows: BrowserContext[] = [];
const helperVars = {
  paths: {
    library: './node_modules/scrapeyard/lib',
  },
};
const controllers: Record<string, any> = {};
const serverVars = {
  paths: {
    tmp: tools.genAbsolutePath('src/tmp'),
    botsDir: tools.genAbsolutePath('src/bots'),
    views: {
      srcDir: 'ui/views/src',
      buildDir: 'ui/views/build',
    },
    rootViewDir: tools.genAbsolutePath('src/root/ui'),
    home: {
      srcDir: 'src',
      buildDir: 'build',
    },
    viteBuildConfig: tools.genAbsolutePath(
      `${helperVars.paths.library}/vite.config.build.ts`,
    ),
    buildLog: tools.genAbsolutePath(
      `${helperVars.paths.library}/buildLog.json`,
    ),
    // for checking if the views dependencies have changed
    viewUtils: tools.genAbsolutePath(
      `${helperVars.paths.library}/viewsInterface.js`,
    ),
  },
  windows,
  controllers,
};

export default serverVars;
