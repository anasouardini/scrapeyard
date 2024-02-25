import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import readLineSync from 'readline-sync';
import fse from 'fs-extra';
import 'colors';

import vars from './vars';
import tools from './tools';

// const currentPath = path.join(__dirname);
// const dirList = fs
//   .readdirSync(currentPath, { withFileTypes: true })
//   .filter((dir) => dir.name);
// const parentDirList = fs
//   .readdirSync(parentPath, { withFileTypes: true })
//   .filter((dir) => dir.name);

// console.log({
//   currentPath,
//   dirList,
//   parentPath,
//   parentDirList,
// });

const packageInfo = getPackageInfo(vars.parentPath);
export function showUsage() {
  console.log(`Usage: pnpm create ${packageInfo.name} [project name]`);
  // console.log('Options:');
  // vars.availableArgs.forEach((arg) => {
  //   console.log(`   ${arg.name}: ${arg.description}`);
  // });
}

export function parseArgs(args: string[]) {
  return true;
}

export function createTemplateProject(args: string[]) {
  if (args.length > 1) {
    console.log('too many arguments.');
    showUsage();
    return false;
  }

  let projectName = args[0];

  if (!projectName) {
    projectName = readLineSync.question('What is the name of your project? ', {
      limit: (input) => input.trim().length > 0,
      limitMessage: 'The project has to have a name, try again',
    });
  }

  const templates = fse.readdirSync(vars.templatesDir);

  // const confirmCreateDirectory = readLineSync.keyInYN(`You entered '${projectName}', create directory with this name?`);

  const template = templates[0];
  if (!templates.length) {
    console.log(`Err -> found no templates to instanciate.`.red);
    return;
  }

  const source = path.join(vars.templatesDir, template);
  const destination = path.join(process.cwd(), projectName);

  try {
    fse.copySync(source, destination);
  } catch (err) {
    console.log(`Err -> could not create ${projectName}`.red);
    console.log(err);
    return;
  }

  // updating new project's package.json
  let templatePackageInfo = tools.getPackageInfo(destination);
  templatePackageInfo.name = projectName;
  if (!templatePackageInfo.keywords) {
    templatePackageInfo.keywords = [];
  }
  templatePackageInfo.keywords.push(projectName);

  tools.setPackageInfo(destination, templatePackageInfo);

  // install demo project's dependencies
  console.log('> Installing pnpm');
  execSync(
    `npm i pnpm -g`,
    // @ts-ignore
    (err, stdout, stderr) => {
      if (err || stderr) {
        console.log({ err, stderr });
        process.exit(-1);
      }
    },
  );
  execSync(
    `cd ${destination}`,
    // @ts-ignore
    (err, stdout, stderr) => {
      if (err || stderr) {
        console.log({ err, stderr });
        process.exit(-1);
      }
    },
  );
  console.log('> Installing project dependencies');
  execSync(
    `pnpm i --prefix ${destination}`,
    // @ts-ignore
    (err, stdout, stderr) => {
      if (err || stderr) {
        console.log({ err, stderr });
        process.exit(-1);
      }
    },
  );

  // start the demo project
  execSync(
    `pnpm run start --prefix ${destination}`,
    // @ts-ignore
    (err, stdout, stderr) => {
      if (err || stderr) {
        console.log({ err, stderr });
        process.exit(-1);
      }
    },
  );
}

function printFileTree(dir, prefix = '', ignoredDirs: string[] = []) {
  // Get contents of the directory
  const files = fs.readdirSync(dir);

  // Loop through each item in the directory
  files.forEach((file, index) => {
    // Construct full path to the item
    const filePath = path.join(dir, file);

    // Check if it's a directory
    if (fs.statSync(filePath).isDirectory()) {
      // Check if the directory should be ignored
      if (!ignoredDirs.includes(file)) {
        // Print directory name
        console.log(
          `${prefix}${index === files.length - 1 ? '└──' : '├──'} ${file}/`,
        );
        // Recursively print the contents of the directory
        printFileTree(
          filePath,
          `${prefix}${index === files.length - 1 ? '   ' : '│  '}`,
          ignoredDirs,
        );
      }
    } else {
      // Print file name
      console.log(
        `${prefix}${index === files.length - 1 ? '└──' : '├──'} ${file}`,
      );
    }
  });
}
// printFileTree(parentPath, "", ["node_modules"]);

export interface PackgeInfo {
  name: string;
  version: string;
  repository: {
    url: string;
  };
  bugs: {
    url: string;
  };
  keywords: string[];
  dependencies: Record<string, string>;
}
function getPackageInfo(packgeDir: string): PackgeInfo {
  const packageInfoJSON = fs.readFileSync(
    path.join(packgeDir, 'package.json'),
    'utf-8',
  );
  const packageInfo = JSON.parse(packageInfoJSON);
  return packageInfo;
}

function setPackageInfo(packgeDir: string, infoObj: Record<string, any>) {
  const packageInfoJSON = JSON.stringify(infoObj, null, '  ');
  try {
    fs.writeFileSync(
      path.join(packgeDir, 'package.json'),
      packageInfoJSON,
      'utf-8',
    );
    return true;
  } catch (err) {
    console.log('Err-> ', err);
    return false;
  }
}

export default {
  getPackageInfo,
  setPackageInfo,
  printFileTree,
  createTemplateProject,
};
