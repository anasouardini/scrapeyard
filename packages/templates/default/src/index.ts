import {
  browser,
  serverVars,
  dispatcher,
  type ProjectsControllers,
  type Actions,
} from 'scrapeyard';

const actions: Partial<Actions> = {
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
      action: (root: { home: { load: () => void } }) => root.home.load,
      // actions/button that would be showed in the home view
      data: actions,
      type: 'direct' as 'direct' | 'scrapeyardEvent',
      // direct: directly from the server (this file)
      // scrapeyardEvent: from a view in the browser
    },
  },
};

export default config;
