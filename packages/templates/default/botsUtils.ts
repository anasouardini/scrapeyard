import home from './src/bots/home/controller';
import indeed from './src/bots/jobboards/controller/indeed';
import marocannonces from './src/bots/jobboards/controller/marocannonces';

export const botsActions = { home: home, jobboards: { indeed, marocannonces } };
export type ProjectsControllers = typeof botsActions;
export type BotsControllers = typeof botsActions;

export interface HomeButton {
  txt: string;
  action: (root: BotsControllers) => (...args: any[]) => any;
  data: {};
}
export type HomeButtons = Record<keyof BotsControllers, HomeButton[]>;
