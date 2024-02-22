import home from "../root/controller/index";
import frugalads from "./frugalads/controller/index";
// [import above this line]

const controllers = {
  home,
  frugalads,
  // [add to object above this line]
};

export type ProjectsControllers = typeof controllers;
export default controllers;
