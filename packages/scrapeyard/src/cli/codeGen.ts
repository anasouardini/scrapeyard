import fs from 'fs';
import path from 'path';
import util from 'util';

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
};
const config = {
  dryRun: args.args[0] === 'dry-run',
  paths: {
    codeJoinerFile: path.join(
      process.cwd(),
      'node_modules',
      vars.libName,
      'lib',
      'codeJoiner.ts',
    ),
    projectDirFromCodeJoinerFile: '../..',
    projectSubProjectsDir: path.join(process.cwd(), 'src', 'projects'),
    FSTreeStateStore: path.join(
      process.cwd(),
      'node_modules',
      vars.libName,
      'lib',
      'fsTreeState',
    ),
  },
};

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

  const dispatchTableCode = `const controllers = {${Object.keys(dispatchTableObj).join(', ')}};`;
  let joinerCode = '';
  imports.unshift(
    `import {browser, serverVars, dispatcher} from 'scrapeyard'`,
    // todo: grab config name from entry file in package.json
    `import config from '${config.paths.projectDirFromCodeJoinerFile}/src/index.ts'`,
  );
  // fake temporary code
  {
    interface InitObj {
      init: Record<string, any>;
      dispatch: [any, Record<string, any>];
    }
    const browser = {
      init: (initObj: InitObj['init']) => {},
    };
    async function dispatcher(driver: any, initObj: InitObj['init']) {}
    let config: InitObj;
    let controllers: Record<string, any>;
    let serverVars: Record<string, any>;
    function joiner() {
      serverVars.controllers = controllers;
      browser.init(config.init);
      /*await*/ dispatcher(...config.dispatch);
    }
    //! async-await doesn't go well with Function.toString()
    joinerCode = `async ${joiner.toString().replace('/*await*/', 'await')}\njoiner();`;
  }

  const code = `${imports.join(';\n')}\n\n${dispatchTableCode}\n\n${joinerCode}`;

  return code;
}

function genCodeJoiner() {
  const FSState = scanFS(config.paths.projectSubProjectsDir, '', [
    'node_modules',
  ]);
  // console.log(FSState)

  if (hasChanged(FSState.treeString)) {
    storeState(FSState.treeString);

    const code = genCode(FSState.treeObj);
    // console.log(code);

    if (config.dryRun) {
      console.log(
        `> [dry run mode] writing code to: ${config.paths.codeJoinerFile}`,
        `\nCode:\n${code}`,
      );
    } else {
      fs.writeFileSync(config.paths.codeJoinerFile, code);
    }
  }
}

export default genCodeJoiner;
