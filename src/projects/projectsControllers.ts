import home from "../root/controller/index";
import oneiqai from "./oneiqai/controller/index";
// [import above this line]

const controllers = {
  home,
  oneiqai,
  // [add to object above this line]
};

export type ProjectsControllers = typeof controllers;
export default controllers;
