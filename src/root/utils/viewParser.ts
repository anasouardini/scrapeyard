import fs from "fs";
import tools, { type ViewPath } from "./tools";
import serverVars from "./serverVars";
import builder from "./viewBuilder/viewBuilder";

const getBuildLogObject = ({
  projectName,
  viewName,
}: {
  projectName: string;
  viewName: string;
}) => {
  const buildLogFileJson = fs.readFileSync(serverVars.paths.buildLog, "utf-8");
  if (!buildLogFileJson) {
    console.log(
      `Err (viewParser) -> build log doesn't exist at (${serverVars.paths.buildLog})`,
    );
  }
  interface TimeLog {
    modificationTimeMs: number;
    buildTimeMs: number;
  }
  const viewBuildLogObj = JSON.parse(buildLogFileJson);

  if (!viewBuildLogObj?.[projectName]) {
    return null; // null means it's outdated
  }

  const viewBuildLog: TimeLog = viewBuildLogObj[projectName][viewName];

  return viewBuildLog;
};

const areViewsUtilsUp2Date = ({
  outputBuildTimeMs,
}: {
  outputBuildTimeMs: number;
}) => {
  // todo: [found no lib for this] check modification time of all dependencies of the src view.

  const viewsUtilsDirPath = serverVars.paths.viewUtils;
  const dependencies = fs.readdirSync(viewsUtilsDirPath, {
    withFileTypes: true,
  });
  //* if only one of them is outdated, re-build the view
  const areDepsUp2Date = dependencies.every((dependency) => {
    //* if isDir==true => don't get modification time. consider it up to date
    if (!dependency.name.includes(".")) {
      return true;
    }
    const modificationTimeMs = Math.round(
      fs.statSync(`${dependency.path}/${dependency.name}`).mtimeMs,
    );
    // console.log({
    //   name: dependency.name,
    //   up2Date: modificationTimeMs < outputBuildTimeMs,
    // });
    if (modificationTimeMs < outputBuildTimeMs) {
      return true;
    }
  });
  console.log({ areDepsUp2Date });
  return areDepsUp2Date;
};

const isUp2date = ({
  projectName,
  viewName,
  viewSrcPath,
}: {
  projectName: string;
  viewName: string;
  viewSrcPath: string;
}) => {
  const srcModificationTime = Math.round(fs.statSync(viewSrcPath).mtimeMs);
  const viewStat = getBuildLogObject({
    projectName,
    viewName,
  });
  if (!viewStat) {
    console.log("project does not exist in log, first time build.");
    return false;
  }
  const outputBuildTimeMs = viewStat.buildTimeMs;

  const viewUpdat2Date = outputBuildTimeMs > srcModificationTime;
  const dependenciesUp2Date = areViewsUtilsUp2Date({ outputBuildTimeMs });

  return viewUpdat2Date && dependenciesUp2Date;
};

const parseView = ({
  inlineString,
  projectName,
  viewName,
  vars,
}: {
  inlineString?: string;
  projectName?: string;
  viewName?: string;
  vars?: Record<string, any>;
}): { success: boolean; error?: any; data?: string } => {
  console.log("view parsing requested", { projectName, viewName });
  //* I don't need to specify the current project's name unless it's the "root"(project name) interface that's being injected.
  if (projectName == undefined) {
    // TODO: get current project's name as a default.
    // projectName = currentProject.name;
  }

  let finalViewString = "";

  // TODO: instead of prepending vars, let the client/view request them using the bridge utility, because JSON sucks.
  if (vars) {
    const jsonVars = JSON.stringify(vars);
    finalViewString += `window.localStorage.setItem('vars', \`${jsonVars}\`);\n\n`;
  }

  //* both the view name and the project name are mutually inclusive.
  if (Number(Boolean(viewName)) - Number(Boolean(projectName)) != 0) {
    console.log(
      "Err -> viewName and projectName should exist together in order to locate the view file, have you forgotten one of them?",
      { viewName, projectName },
    );
    return {
      success: false,
      error:
        "Err -> viewName and projectName should exist together in order to locate the view file, have you forgotten one of them?",
    };
  }

  //* redundancy in the checking to satisfy TS.
  if (viewName && projectName) {
    const viewPath = tools.getViewPathObject({ viewName, projectName });
    if (!fs.existsSync(viewPath.src)) {
      console.log(
        `Err -> The src file of the view: "${projectName}/${viewName}" doesn't exist!`,
      );
      console.log({ path: viewPath.src });
      return {
        success: false,
        error: `Err -> The src file of the view: "${projectName}/${viewName}" doesn't exist!`,
      };
    }

    // if the build file doesn't exit or it exists but outdated, build the view.
    if (
      !fs.existsSync(viewPath.build) ||
      !isUp2date({ projectName, viewName, viewSrcPath: viewPath.src })
    ) {
      console.log("* The view is outdated, building...");
      builder({ projectName, viewName });
    }

    let viewString = fs.readFileSync(viewPath.build, "utf-8");
    finalViewString += viewString;
  }

  if (inlineString) {
    finalViewString += inlineString;
  }

  return { success: true, data: finalViewString };
};

export default parseView;
