#!/usr/bin/env node

import tools, { createTemplateProject } from './tools';
import vars from './vars';

// tools.printFileTree(vars.parentPath, '', ['node_modules']);

// function getAction(option: Args['option']) {
//   if (!option) {
//     return (dummy: any[]) => {
//       console.log('you must provide an option.');
//       showUsage();
//     };
//   }

//   for (const arg of vars.availableArgs) {
//     if (arg.name === option) {
//       return arg.action;
//     }
//   }

//   // invalid option
//   return (dummy: any[]) => {
//     console.log(`Invalid option "${option}"`);
//     showUsage();
//   };
// }

export interface Args {
  length: number;
  args: any[];
}

const args: Args = {
  length: process.argv.length,
  args: process.argv.slice(2),
};

createTemplateProject(args.args);

// const action = getAction(args.option);
// action(args.optionArgs);
