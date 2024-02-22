import path from 'path';
import readLineSync from 'readline-sync';
import fse from 'fs-extra';
import fs from 'fs';
import 'colors';
import tools from './tools';

const parentPath = path.join(__dirname, '..', '..');
const templatesDir = path.join(parentPath, 'data', 'templates');
const packagejsonPath = path.join(parentPath, 'package.json');

const availableArgs = [
  {
    name: 'init',
    description: 'Initializes the project',
    action: (args: any[]) => {
      // todo: remove deps from testing
      // todo: find a trick to ignore node_modules in npm
      let projectName = args[0];
      if (!projectName) {
        projectName = readLineSync.question(
          'What is the name of your project? ',
          {
            limit: (input) => input.trim().length > 0,
            limitMessage: 'The project has to have a name, try again',
          },
        );
      }

      const templates = fse.readdirSync(templatesDir);

      // const confirmCreateDirectory = readLineSync.keyInYN(`You entered '${projectName}', create directory with this name?`);

      const template = templates[0];
      const source = path.join(templatesDir, template);
      const destination = path.join(process.cwd(), projectName);

      try {
        fse.copySync(source, destination);
      } catch (err) {
        console.log(`Err -> could not create ${projectName}`.red);
        console.log(err);
        return;
      }

      // updating new project's package.json
      let scrapeyardPackageInfo = tools.getPackageInfo(parentPath);
      let templatePackageInfo = tools.getPackageInfo(destination);
      templatePackageInfo.name = projectName;
      templatePackageInfo.keywords.push(projectName);
      // adding scrapeyard to package.json using the exact version that's initializing the new project.
      if (!templatePackageInfo.dependencies) {
        templatePackageInfo.dependencies = {};
      }
      templatePackageInfo.dependencies[scrapeyardPackageInfo.name] =
        `^${scrapeyardPackageInfo.version}`;

      tools.setPackageInfo(destination, templatePackageInfo);
    },
  },
  {
    name: 'sync',
    description: 'updates types to include newly added projects and views',
    action: () => {
      // todo: add types
      console.log('syncing...');
    },
  },
];

// export type Options = (typeof availableArgs)[number]["name"];
export interface Args {
  length: number;
  option: 'init' | 'sync';
  optionArgs: any[];
}

export default {
  parentPath,
  packagejsonPath,
  availableArgs,
};
