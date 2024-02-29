import {
  browser,
  serverVars,
  dispatcher,
  controllers,
  type ProjectsControllers,
  type BotsControllers,
  type HomeButtons,
} from 'scrapeyard';

// * initializing joabboard (demo bot)'s DB
// import schema from './bots/jobboards/model/schema';
// schema({type: 'init'});
// process.exit(0);

const homeButtons: HomeButtons = {
  home: [],
  jobboards: [
    {
      txt: 'collect',
      action: (root) => root.jobboards.marocannonces.collect,
      data: {},
    },
    {
      txt: 'parse',
      action: (root) => root.jobboards.marocannonces.parse,
      data: {},
    },
    {
      txt: 'apply',
      action: (root) => root.jobboards.marocannonces.apply,
      data: {},
    },
  ],
  frugalads: [
    {
      txt: 'Spread Words',
      action: (root) => root.frugalads.chatiwus.start,
      data: {},
    },
  ],
};

// todo: need type for config
const config = {
  init: {
    // initializes browser instances/windows
    instances: [
      // stateful: uses specified profile path
      { stateful: true, headless: false },
      // { stateful: false, headless: true },
    ],
  },
  dispatch: {
    windowIndex: 0,
    // runs a controller from "root.home" and passes it empty object "{}"
    msg: {
      action: (root: BotsControllers) => root.home.load,
      // actions/button that would be showed in the home view
      data: homeButtons,
      type: 'direct' as 'direct' | 'scrapeyardEvent',
      // direct: directly from the server (this file)
      // scrapeyardEvent: from a view in the browser
    },
  },
};

export default config;
