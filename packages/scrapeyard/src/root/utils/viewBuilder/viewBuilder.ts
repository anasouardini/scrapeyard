import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import serverVars from '../serverVars';

// vite imports
import { build, defineConfig, InlineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import react from '@vitejs/plugin-react';
import cssByJs from 'vite-plugin-css-injected-by-js';
// import tsconfigPaths from 'vite-tsconfig-paths';

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

async function buildView({ project, view }) {
  console.log('* vite build');
  // console.log(tools.bashExec.name);
  // execSync(`vite build -c '${serverVars.paths.viteBuildConfig}'`);
  try {
    await build(
      defineConfig({
        logLevel: 'info',
        plugins: [react(), cssByJs() /*tsconfigPaths()*/],
        build: {
          target: 'es2020',
          minify: false,
          emptyOutDir: false,
          // changing the dist dir for easier automation
          outDir:
            project.name == 'root'
              ? path.join(
                  serverVars.paths.rootViewDir,
                  serverVars.paths.home.buildDir,
                )
              : path.join(
                  serverVars.paths.botsDir,
                  project.name,
                  serverVars.paths.views.buildDir,
                ),
          rollupOptions: {
            input: {
              [view.name.split('.')[0]]: view.path,
            },
            output: {
              // to bundle everything
              manualChunks: undefined,
              // to prevent the hashes suffixes and /dist/assets dir
              entryFileNames: '[name].js',
              chunkFileNames: '[name].js',
              assetFileNames: '[name].[ext]',
            },
          },
        },
      }),
    );
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Error occurred during build:', error);
    process.exit(1); // Exit with non-zero code to indicate failure
  }
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
  interface TimeLog {
    modificationTimeMs: number;
    buildTimeMs: number;
  }
  type BuildLog = Record<string, Record<string, TimeLog>>;
  const buildLog = JSON.parse(
    fs.readFileSync(serverVars.paths.buildLog, 'utf-8'),
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

function getBotsDirsList() {
  const targetPath = serverVars.paths.botsDir;

  const dirList = fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((dirObj) => {
      //   console.log("dirObj", dirObj);
      return !dirObj.name.includes('.'); // no extensions = a project directory, not a file

      // ! Nextjs uses an old version of Nodejs
      // return dirObj.entry?.isDirectory;
    })
    .map((dirObj) => ({
      name: dirObj.name,
      path: `${targetPath}/${dirObj.name}`,
    }));

  // add the root path (for including the home view).
  dirList.push({ name: 'root', path: serverVars.paths.rootViewDir });

  return dirList as { name: string; path: string }[];
}

function getViewsFilesList(projectDirPath: string) {
  let projectViewComponentsPath = `${projectDirPath}/${serverVars.paths.views.srcDir}`;

  // TODO: replace this hack
  if (projectDirPath.includes('root')) {
    projectViewComponentsPath = `${projectDirPath}/src`;
  }

  // console.log(projectViewComponentsPath);
  const dirList = fs
    .readdirSync(projectViewComponentsPath, { withFileTypes: true })
    .filter((dirObj) => dirObj.name.includes('.tsx'))
    .map((dirObj) => ({
      name: dirObj.name,
      path: `${projectViewComponentsPath}/${dirObj.name}`,
    }));

  return dirList as { name: string; path: string }[];
}

export default async function builder(targetComponent: View) {
  console.log(
    `============================ target: ${targetComponent.projectName}/${targetComponent.viewName}`,
  );

  interface Project {
    name: string;
    path: string;
  }
  let botsList: Project[] = getBotsDirsList();

  if (targetComponent.projectName) {
    // if one is specified, remove the other bots from the list
    const filteredList = botsList.filter(
      (project) => project.name == targetComponent.projectName,
    );
    if (!filteredList.length) {
      console.log(
        `Err (buildViews.ts) -> the bot (${targetComponent.projectName}) you've provided does not exist.`,
      );
      return;
    }
    botsList = filteredList;
  }
  for (const project of botsList) {
    interface View {
      name: string;
      path: string;
    }
    let viewsList: View[] = getViewsFilesList(project.path);

    // console.log(viewsList);
    if (targetComponent.viewName) {
      const filteredList = viewsList.filter(
        (view) => view.name.split('.')[0] == targetComponent.viewName,
      );
      if (!filteredList.length) {
        console.log(
          `Err (buildViews.ts) -> the view (${targetComponent.viewName}) you've provided does not exist.`,
        );
        return;
      }
      viewsList = filteredList;
    }

    for (const view of viewsList) {
      let viewCompoentPath = view.path; // path includes extension (.tsx)

      // viewComponent2StandaloneScript(viewCompoentPath);
      await buildView({ project, view });
      // standaloneScript2ViewComponent(viewCompoentPath);
      updateBuildLog({
        projectName: project.name,
        viewName: view.name.split('.')[0],
        viewSrcPath: view.path,
      });
      console.log('Vite Build : END');
    }
  }
}
