import { execSync } from 'child_process';
import fs, { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import util from 'util';
import ts from 'typescript';

const args = {
  length: process.argv.length,
  args: process.argv.slice(2),
};

interface File {
  type: 'file';
  name: string;
  content: string;
}
interface Directory {
  type: 'dir';
  name: string;
  content: Entry[];
}

type Entry = File | Directory;

const vars = {
  libName: 'scrapeyard',
  codeJoinerName: 'codeJoiner',
  libMainInterfaceName: 'mainInterface',
  codeJoinerTypesMarkerStart: 'declare const dynamicallyAppenedTypesStart;',
  codeJoinerTypesMarkerEnd: 'declare const dynamicallyAppenedTypesEnd;',
};
interface Paths {
  outputDir: string;
  codeJoinerFile: string;
  projectDirFromCodeJoinerFile: string;
  projectSubProjectsDir: string;
}
interface Config {
  dryRun: boolean;
  paths: Paths;
}
let config: Config = {
  dryRun: args.args[0] === 'dry-run',
  // @ts-ignore
  paths: {
    outputDir: path.join(process.cwd()),
    codeJoinerFile: path.join(process.cwd(), `${vars.codeJoinerName}.ts`),
    projectDirFromCodeJoinerFile: '.',
    projectSubProjectsDir: path.join(process.cwd(), 'src', 'projects'),
  },
};
interface Paths {
  libraryLibPath: string;
}
config.paths.libraryLibPath = path.join(
  process.cwd(),
  'node_modules',
  vars.libName,
  'lib',
);
interface Paths {
  FSTreeStateStore: string;
}
config.paths.FSTreeStateStore = path.join(
  config.paths.libraryLibPath,
  'fsTreeState',
);

function scanFS(
  dirPath: string,
  prefix = '',
  ignoredDirs: string[] = [],
): { treeString: string; treeObj: Entry[] } {
  const FSTreeString: string[] = [];

  function FSTreeGenerator(
    dirPath: string,
    prefix = '',
    ignoredDirs: string[] = [],
  ) {
    const files = fs.readdirSync(dirPath);

    return files.map((file, index) => {
      const filePath = path.join(dirPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        if (!ignoredDirs.includes(file)) {
          // append directory name
          FSTreeString.push(
            `${prefix}${index === files.length - 1 ? '└──' : '├──'} ${file}/`,
          );

          return {
            content: FSTreeGenerator(
              filePath,
              `${prefix}${index === files.length - 1 ? '   ' : '│  '}`,
              ignoredDirs,
            ),
            name: file,
            type: 'dir',
          };
        }
      } else {
        // append file name
        FSTreeString.push(
          `${prefix}${index === files.length - 1 ? '└──' : '├──'} ${file}`,
        );

        return {
          constent: filePath,
          name: file,
          type: 'file',
        };
      }
    });
  }

  const FSTreeObj = FSTreeGenerator(dirPath, prefix, ignoredDirs);
  return { treeString: FSTreeString.join('\n'), treeObj: FSTreeObj };
}

function storeState(state: string) {
  if (config.dryRun) {
    console.log(
      `[dry run mode] saving state to: ${config.paths.FSTreeStateStore}`,
      `\nState:\n${state}`,
    );
    return;
  }
  fs.writeFileSync(config.paths.FSTreeStateStore, state);
}

function hasChanged(currentFSTreeSate: string): boolean {
  try {
    if (config.dryRun) {
      console.log(
        `> [dry run mode] reading prior state: ${config.paths.FSTreeStateStore}\nassuming state has changed.`,
      );
      return true;
    }
    const periorFSTreeState = fs.readFileSync(
      config.paths.FSTreeStateStore,
      'utf-8',
    );

    return periorFSTreeState !== currentFSTreeSate;
  } catch (err) {
    // console.log(err.code); //ENOENT
    return true; // doesn't exist is same as has changed.
  }
}

function genCode(projectsList: Entry[]) {
  const imports: string[] = [];
  const dispatchTableObj = {};

  // looping through list of entries in "projects" dir
  for (const entry of projectsList) {
    if (entry.type !== 'dir') {
      continue;
    }
    const projectDir = entry;

    const controllerDir = projectDir.content.filter(
      (child) => child.name === 'controller' && child.type === 'dir',
    )[0] as Directory;

    if (!controllerDir) {
      console.log(
        `Warning -> found no controller dir in project ${projectDir.name}`,
      );
      continue;
    }

    const childrenCodeFiles = controllerDir.content.filter((child) => {
      const isFile = child.type === 'file';
      const isTSorJS = child.name.includes('.ts') || child.name.includes('.js');
      return isFile && isTSorJS;
    });

    const hasIndexFile = childrenCodeFiles.some((child) => {
      const hasIndexFile = child.name == 'index.ts' || child.name == 'index.js';
      return hasIndexFile;
    });

    if (hasIndexFile) {
      imports.push(
        `import ${projectDir.name} from '${config.paths.projectDirFromCodeJoinerFile}/src/projects/${projectDir.name}/controller'`,
      );
      dispatchTableObj[projectDir.name] = 'dummy';
    } else {
      for (const child of childrenCodeFiles) {
        const controllerName = child.name.split('.')[0];
        imports.push(
          `import ${controllerName} from '${config.paths.projectDirFromCodeJoinerFile}/src/projects/${projectDir.name}/controller/${controllerName}'`,
        );
        dispatchTableObj[controllerName] = 'dummy';
      }
    }
  }

  const dispatchTableInitilization = `export const controllers = {${Object.keys(dispatchTableObj).join(', ')}};`;
  const dispatchTableCodeTypeExport = `export type ProjectsControllers = typeof controllers;`;
  const superSetTypesExports = `
    export interface HomeButton {
      txt: string;
      action: (root: ProjectsControllers) => (...args: any[]) => any;
      data: {};
    }
    export type HomeButtons = Record<keyof ProjectsControllers, HomeButton[]>;
  `;
  const dispatchTableCode = `${dispatchTableInitilization}\n${dispatchTableCodeTypeExport}\n\n${superSetTypesExports}`;
  imports.unshift(
    `import {browser, serverVars, dispatcher} from '${vars.libName}'`,
    // todo: grab config name from entry file in package.json
    `import config from '${config.paths.projectDirFromCodeJoinerFile}/src'`,
  );
  let joinerCode = '';
  // fake temporary code
  {
    interface InitObj {
      init: Record<string, any>;
      dispatch: Record<string, any>;
    }
    const browser = {
      init: (initObj: InitObj['init']) => {},
    };
    async function dispatcher(driver: any, initObj: InitObj['init']) {}
    let config: InitObj;
    let controllers: Record<string, any>;
    let serverVars: Record<string, any>;

    async function joiner() {
      serverVars.controllers = controllers;
      await browser.init(config.init);
      const targetWindow = serverVars.windows[config.dispatch.windowIndex];
      await dispatcher(targetWindow, config.dispatch.msg);
    }
    joinerCode = `${joiner
      .toString()
      // @ts-ignore
      .replaceAll('/*await*/', 'await')}\njoiner();`;
  }

  const code = `${imports.join(';\n')}\n\n${dispatchTableCode}\n\n${joinerCode}`;

  return code;
}

function writeCode(code: string) {
  if (config.dryRun) {
    console.log(
      `> [dry run mode] writing code to: ${config.paths.codeJoinerFile}`,
      `\nCode:\n${code}`,
    );
  } else {
    fs.writeFileSync(config.paths.codeJoinerFile, code);
  }
}

function appendTypesToLib() {
  const codeJoinerTypesFilePath = `${config.paths.libraryLibPath}/${vars.codeJoinerName}.d.ts`;
  const libraryTypesFilePath = `${config.paths.libraryLibPath}/${vars.libMainInterfaceName}.d.ts`;
  try {
    // merge types with library's main interface types
    const types = readFileSync(codeJoinerTypesFilePath);
    const nowDate = `/* Added at: ${new Date().toISOString()}*/`;
    // console.log({ nowDate });
    const markedTypesToBeAppended = `\n${vars.codeJoinerTypesMarkerStart}\n${nowDate}\n\n${types}\n\n${vars.codeJoinerTypesMarkerEnd}`;

    const libTypes = readFileSync(libraryTypesFilePath, 'utf-8');
    if (libTypes.includes(vars.codeJoinerTypesMarkerStart)) {
      console.log('> adding updated types to library');
      const oldTypesRegExp = new RegExp(
        `${vars.codeJoinerTypesMarkerStart}[\\s\\S]+${vars.codeJoinerTypesMarkerEnd}`,
      );

      const newLibraryTypes = libTypes.replace(
        oldTypesRegExp,
        markedTypesToBeAppended,
      );

      const updatedDate = newLibraryTypes
        .split('\n')
        .filter((line) => line.includes('Added at'))[0];
      // console.log({
      //   nowDate,
      //   updatedDate,
      // });
      if (nowDate !== updatedDate) {
        console.log(`Err -> couldn't replace old types`);
      }
      fs.writeFileSync(libraryTypesFilePath, newLibraryTypes, 'utf-8');
    } else {
      console.log('> adding types to library');
      fs.appendFileSync(libraryTypesFilePath, markedTypesToBeAppended, 'utf-8');
    }

    fs.unlinkSync(codeJoinerTypesFilePath);
  } catch (err) {
    console.log(
      `Err -> couldn't append code joiner types to main library types:\n ${err}`,
    );
    return;
  }
}

function genTypes() {
  try {
    console.log('> syncing types');
    // generate a config file for 'tsc' (doesn't ignore the one that exists)
    const tmpTsconfigObj = {
      compilerOptions: {
        target: 'esNext',
        lib: ['es6'],
        outDir: config.paths.libraryLibPath,
        module: 'CommonJS',
        allowJs: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        noImplicitAny: false,
        skipLibCheck: true,
        moduleResolution: 'node',
        declaration: true,
        emitDeclarationOnly: true,
      },
      include: [config.paths.codeJoinerFile],
      // exclude: [`${config.paths.outputDir}/src`],
    };
    const tmpTsconfigFileName = `${vars.codeJoinerName}.config.json`;
    const tmpTsconfigFile = `${config.paths.libraryLibPath}/${tmpTsconfigFileName}`;
    fs.writeFileSync(tmpTsconfigFile, JSON.stringify(tmpTsconfigObj));
    // console.log({ codeJoinerPath });
    try {
      console.log(`> generating declaration files`);
      execSync(`tsc -p "${tmpTsconfigFile}";`);
    } catch (err) {
      // todo: some tsc errors are not errors; USE TYPESCRIPT PROGRAMATICALLY
      const notRealError = true;
      if (notRealError) {
        appendTypesToLib();
      } else {
        console.log(`Err -> couldn't generate declaration files`);
        return;
      }
    }
  } catch (err) {
    console.log(
      `Err -> could not generate types for ${vars.codeJoinerName}:\n${err}`,
    );
    return;
  }
}

function genCodeJoiner() {
  const FSState = scanFS(config.paths.projectSubProjectsDir, '', [
    'node_modules',
  ]);
  // console.log(FSState)

  // todo: either also check files' content (because of types change) or don't check at all
  // if (!hasChanged(FSState.treeString)) {
  //   return config.paths.codeJoinerFile;
  // }

  storeState(FSState.treeString);

  const code = genCode(FSState.treeObj);
  writeCode(code);
  genTypes();
  // console.log(code);

  return config.paths.codeJoinerFile;
}

export default genCodeJoiner;
