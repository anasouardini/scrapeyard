#!/bin/env node

import createProject from "../root/utils/projectInitializer";
import serverVars from "../root/utils/serverVars";

const args = {
  length: process.argv.length,
  projectName: process.argv[2],
};

if (!args.projectName) {
  console.error("You haven't specified a project name!");
  process.exit(1);
}

createProject({ projectName: args.projectName });
