import oneiqai from "./oneiqai/controller/index";
// [import above this line]

const controllers = {
  oneiqai,
  // [add to object above this line]
};

export type ProjectsControllers = typeof controllers;
export default controllers;
