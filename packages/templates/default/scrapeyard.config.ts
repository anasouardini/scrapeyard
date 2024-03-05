const config = {
  init: {
    // initializes browser instances/windows
    instances: [
      // stateful: uses specified profile path
      { stateful: true, headless: false },
      // { stateful: false, headless: true },
    ],
  },
};

export default config;
