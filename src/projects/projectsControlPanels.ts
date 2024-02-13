import oneiqai from "./oneiqai/ui/cp/controlPanel";
// [import above this line]

const controlPanels = {
  oneiqai,
  // [add to object above this line]
};

export type ProjectName = keyof typeof controlPanels;
export default controlPanels;
