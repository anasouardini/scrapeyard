#!/bin/env node

import tools from './tools';
import vars, { Args } from './vars';

// tools.printFileTree(vars.parentPath, "", ["node_modules"]);

const packageInfo = tools.getPackageInfo(vars.parentPath);

function showUsage() {
  console.log(`Usage: pnpx ${packageInfo.name} [option]`);
  console.log('Options:');
  vars.availableArgs.forEach((arg) => {
    console.log(`   ${arg.name}: ${arg.description}`);
  });
}

function getAction(option: Args['option']) {
  if (!option) {
    return (dummy: any[]) => {
      console.log('you must provide an option.');
      showUsage();
    };
  }

  for (const arg of vars.availableArgs) {
    if (arg.name === option) {
      return arg.action;
    }
  }

  // invalid option
  return (dummy: any[]) => {
    console.log(`Invalid option "${option}"`);
    showUsage();
  };
}

const args: Args = {
  length: process.argv.length,
  // @ts-ignore
  option: process.argv[2],
  optionArgs: process.argv.slice(3),
};

const action = getAction(args.option);
action(args.optionArgs);
