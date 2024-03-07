import { browser, serverVars, dispatcher } from 'scrapeyard';
import config from './scrapeyard.config';
import home from './src/bots/home/controller';
import indeed from './src/bots/jobboards/controller/indeed';
import marocannonces from './src/bots/jobboards/controller/marocannonces';

export const controllers = { home: home, jobboards: { indeed, marocannonces } };
export type ProjectsControllers = typeof controllers;
export type BotsControllers = typeof controllers;

export interface HomeButton {
  txt: string;
  action: (root: BotsControllers) => (...args: any[]) => any;
  data: {};
}
export type HomeButtons = Record<keyof BotsControllers, HomeButton[]>;

async function joiner() {
  serverVars.controllers = controllers;
  await browser.init(config.init);
  const targetWindow = serverVars.windows[0];
  await dispatcher(targetWindow, {
    type: 'direct',
    action: (root) => root.home.load,
    data: {},
  });
}

if (process.argv[2] === 'run') {
  joiner();
}
