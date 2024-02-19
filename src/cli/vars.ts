import path from "path";
import readLineSync from "readline-sync";
import fse from "fs-extra";
import fs from "fs";
import "colors";
import tools from "./tools";
import vars from "./vars";

const parentPath = path.join(__dirname, "..");
const packagejsonPath = path.join(__dirname, "..", "package.json");

const availableArgs = [
  {
    name: "init",
    description: "Initializes the project",
    action: (args: any[]) => {
      let projectName = args[0];
      if (!projectName) {
        projectName = readLineSync.question(
          "What is the name of your project? ",
          {
            limit: (input) => input.trim().length > 0,
            limitMessage: "The project has to have a name, try again",
          },
        );
      }

      const templatesDir = path.join(__dirname, "..", "data", "templates");
      const templates = fse.readdirSync(templatesDir);

      // const confirmCreateDirectory = readLineSync.keyInYN(`You entered '${projectName}', create directory with this name?`);

      const template = templates[0];
      const source = path.join(templatesDir, template);
      const destination = path.join(process.cwd(), projectName);

      fse
        .copy(source, destination)
        .then(() => {
          console.log(`Successfully created ./${projectName}`.green);
        })
        .catch((err) => {
          console.error("err: ", err);
        });

      // updating new project's package.json
      let scrapeyardPackageInfo = tools.getPackageInfo(vars.parentPath);
      let templatePackageInfo = tools.getPackageInfo(destination);
      templatePackageInfo.name = projectName;
      templatePackageInfo.keywords.push(projectName);
      templatePackageInfo.repository.url =
        templatePackageInfo.repository.url.replace("projectname", projectName);
      templatePackageInfo.bugs.url = templatePackageInfo.bugs.url.replace(
        "projectname",
        projectName,
      );
      // adding scrapeyard to package.json using the exact version that's initializing the new project.
      templatePackageInfo.dependencies[projectName] =
        `^${scrapeyardPackageInfo.version}`;
      tools.setPackageInfo(destination, templatePackageInfo);
    },
  },
  {
    name: "sync",
    description: "updates types to include newly added projects and views",
    action: () => {
      // todo: add types
      console.log("syncing...");
    },
  },
];

// export type Options = (typeof availableArgs)[number]["name"];
export interface Args {
  length: number;
  option: "init" | "sync";
  optionArgs: any[];
}

export default {
  parentPath,
  packagejsonPath,
  availableArgs,
};
