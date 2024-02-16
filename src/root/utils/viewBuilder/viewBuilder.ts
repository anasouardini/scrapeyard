import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import serverVars from "../serverVars";

interface View {
  projectName: string;
  viewName: string;
}

// function viewComponent2StandaloneScript(viewPath: string) {
//   let viewCompoentSrcCode = fs.readFileSync(viewPath, "utf-8");
//   viewCompoentSrcCode = viewCompoentSrcCode.replace(
//     /^\/\/ ReactDOM.createRoot/,
//     "ReactDOM.createRoot",
//   );
//   viewCompoentSrcCode = viewCompoentSrcCode.replace(
//     /^export default.*/ig,
//     "// export default",
//   );
//   console.log("* comp => standalone");
//   // console.log(viewCompoentSrcCode);
//   fs.writeFileSync(viewPath, viewCompoentSrcCode);
// }

// function standaloneScript2ViewComponent(viewPath: string) {
//   let viewCompoentSrcCode = fs.readFileSync(viewPath, "utf-8");
//   viewCompoentSrcCode = viewCompoentSrcCode.replace(
//     /^ReactDOM.createRoot/,
//     "// ReactDOM.createRoot",
//   );
//   viewCompoentSrcCode = viewCompoentSrcCode.replace(
//     "// export default",
//     "export default",
//   );
//   console.log("* standalone => comp");
//   // console.log(viewCompoentSrcCode);
//   fs.writeFileSync(viewPath, viewCompoentSrcCode);
// }

function setupViteConfig({ project, view }) {
  const viteBuildConfigPath = path.join(serverVars.paths.viteBuildConfig);
  let viteBuildConfigCode = fs.readFileSync(viteBuildConfigPath, "utf-8");
  viteBuildConfigCode = viteBuildConfigCode.replace(
    /input:\s*{\s*([^}]*)\s*}/,
    `input: {'${view.name.split(".")[0]}':'${view.path}'}`,
  );
  const outDirPath =
    project.name == "root"
      ? `outDir: "${serverVars.paths.rootViewDir}/${serverVars.paths.home.buildDir}",`
      : `outDir: "${serverVars.paths.projectsDir}/${project.name}/${serverVars.paths.views.buildDir}",`;

  viteBuildConfigCode = viteBuildConfigCode.replace(
    /outDir:\s*("[^"]*"),/,
    outDirPath,
  );
  console.log("* vite build config");
  fs.writeFileSync(viteBuildConfigPath, viteBuildConfigCode);
}

function buildView() {
  console.log("* vite build");
  // todo: implement exec properly
  // todo: you should run vite relative to the project's root path, or install vite globally?
  // console.log(tools.bashExec.name);
  execSync(`vite build -c '${serverVars.paths.viteBuildConfig}'`);
}

function updateBuildLog({
  projectName,
  viewName,
  viewSrcPath,
}: {
  projectName: string;
  viewName: string;
  viewSrcPath: string;
}) {
  // todo: add "pnpm sync" to get all projects and their views names set in /src/root/utils/types/projectsTypes...
  interface TimeLog {
    modificationTimeMs: number;
    buildTimeMs: number;
  }
  type BuildLog = Record<string, Record<string, TimeLog>>;
  const buildLog = JSON.parse(
    fs.readFileSync(serverVars.paths.buildLog, "utf-8"),
  );

  // first time building on of the project's views
  if (!buildLog?.[projectName]) {
    buildLog[projectName] = {
      [viewName]: {
        buildTimeMs: 0,
      },
    };
  }
  // first time building this particular view
  if (!buildLog?.[projectName][viewName]) {
    buildLog[projectName][viewName] = {
      buildTimeMs: 0,
    };
  }

  const viewBuildLogObj: TimeLog = buildLog[projectName][viewName];
  // const srcModificationtimeMS = Math.round(fs.statSync(viewSrcPath).mtimeMs);
  const buildTimeMS = Math.round(new Date().getTime());
  // viewBuildLogObj.modificationTimeMs = srcModificationtimeMS;
  viewBuildLogObj.buildTimeMs = buildTimeMS;

  // add the new times to the log obj
  buildLog[projectName][viewName] = viewBuildLogObj;

  // console.log({ viewBuildLogObj, projectName, viewName, buildLog });

  // update the log files with the new log data
  fs.writeFileSync(serverVars.paths.buildLog, JSON.stringify(buildLog));
}

function getProjectsDirsList() {
  //   console.log("get projects dir list", vars.paths.projectsDir);
  const targetPath = serverVars.paths.projectsDir;

  const dirList = fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((dirObj) => {
      //   console.log("dirObj", dirObj);
      return !dirObj.name.includes("."); // no extensions = a project directory, not a file

      // ! Nextjs uses an old version of Nodejs
      // return dirObj.entry?.isDirectory;
    })
    .map((dirObj) => ({
      name: dirObj.name,
      path: `${targetPath}/${dirObj.name}`,
    }));

  // add the root path (for including the home view).
  dirList.push({ name: "root", path: serverVars.paths.rootViewDir });

  return dirList as { name: string; path: string }[];
}

function getViewsFilesList(projectDirPath: string) {
  let projectViewComponentsPath = `${projectDirPath}/${serverVars.paths.views.srcDir}`;

  // TODO: replace this hack
  if (projectDirPath.includes("root")) {
    projectViewComponentsPath = `${projectDirPath}/src`;
  }

  // console.log(projectViewComponentsPath);
  const dirList = fs
    .readdirSync(projectViewComponentsPath, { withFileTypes: true })
    .filter((dirObj) => dirObj.name.includes(".tsx"))
    .map((dirObj) => ({
      name: dirObj.name,
      path: `${projectViewComponentsPath}/${dirObj.name}`,
    }));

  return dirList as { name: string; path: string }[];
}

export default function builder(targetComponent: View) {
  console.log(
    `============================ target: ${targetComponent.projectName}/${targetComponent.viewName}`,
  );

  interface Project {
    name: string;
    path: string;
  }
  let projectsList: Project[] = getProjectsDirsList();

  if (targetComponent.projectName) {
    // if one is specified, remove the other projects from the list
    const filteredList = projectsList.filter(
      (project) => project.name == targetComponent.projectName,
    );
    if (!filteredList.length) {
      console.log(
        `Err (buildViews.ts) -> the project (${targetComponent.projectName}) you've provided does not exist.`,
      );
      return;
    }
    projectsList = filteredList;
  }
  projectsList.forEach((project) => {
    interface View {
      name: string;
      path: string;
    }
    let viewsList: View[] = getViewsFilesList(project.path);

    // console.log(viewsList);
    if (targetComponent.viewName) {
      const filteredList = viewsList.filter(
        (view) => view.name.split(".")[0] == targetComponent.viewName,
      );
      if (!filteredList.length) {
        console.log(
          `Err (buildViews.ts) -> the view (${targetComponent.viewName}) you've provided does not exist.`,
        );
        return;
      }
      viewsList = filteredList;
    }

    viewsList.forEach((view) => {
      let viewCompoentPath = view.path; // path includes extension (.tsx)

      // viewComponent2StandaloneScript(viewCompoentPath);
      setupViteConfig({ project, view });
      buildView();
      // standaloneScript2ViewComponent(viewCompoentPath);
      updateBuildLog({
        projectName: project.name,
        viewName: view.name.split(".")[0],
        viewSrcPath: view.path,
      });
      console.log("Vite Build : END");
    });
  });
}
