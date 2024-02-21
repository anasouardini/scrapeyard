import { type ProjectsControllers } from "../../projects/projectsControllers";

export type RequestBodyType = {
  eventType: "runAction" | "clientRequestsUpdate";
  action?: string;
  data?: string | {};
};

export interface Actions {
  txt: string;
  data: any;
  action: (root: ProjectsControllers) => (...args: any[]) => any;
  // actionCall: (root: ProjectsControllers) => any;
}
