import { type ProjectsControllers } from '../../projects/projectsControllers';

export type RequestBodyType = {
  eventType: 'runAction' | 'clientRequestsUpdate';
  action?: string;
  data?: string | {};
};

export interface Action {
  txt: string;
  data: any;
  action: (root: ProjectsControllers) => (...args: any[]) => any;
  // actionCall: (root: ProjectsControllers) => any;
}

export type Actions = Record<keyof ProjectsControllers, Action[]>;