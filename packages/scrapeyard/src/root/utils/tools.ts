import path from 'path';
import serverVars from './serverVars';

const genAbsolutePath = (relativePath: string = '.') => {
  return path.join(`${process.cwd()}/${relativePath}`);
};

//? I should probably use this method instead of looping over all the projects and views in $utils/buildViews.ts.
export interface ViewPath {
  src: string;
  build: string;
}
function getViewPathObject({
  projectName,
  viewName,
}: {
  projectName: string;
  viewName: string;
}): ViewPath {
  if (projectName == 'root') {
    const rootViewPath = `${serverVars.paths.rootViewDir}`;
    return {
      src: `${rootViewPath}/${serverVars.paths.home.srcDir}/${viewName}.tsx`,
      build: `${rootViewPath}/${serverVars.paths.home.buildDir}/${viewName}.js`,
    };
  }

  const projectViewsPath = `${serverVars.paths.projectsDir}/${projectName}`;
  return {
    src: `${projectViewsPath}/${serverVars.paths.views.srcDir}/${viewName}.tsx`,
    build: `${projectViewsPath}/${serverVars.paths.views.buildDir}/${viewName}.js`,
  };
}

const cleanString = (string) => {
  return string
    .split('\n')
    .map((line) => {
      if (!line.length) {
        return '';
      }

      return line.replace(/( |\t)+/g, ' ').replace(/^( |\t)+/g, '');
    })
    .join('\n');
};

const randomNumber = ({ min, max }: { min: number; max: number }) => {
  let minCeiled = Math.ceil(min);
  let maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
};

const randomChars = ({ length }: { length: number }) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

const print: { [key: string]: (msg: string) => void } = {
  title: (msg: string) => {
    console.log(`\x1b[33m${msg}\x1b[0m`);
  },
  error: (msg: string) => {
    console.log(`\x1b[31m${msg}\x1b[0m`);
  },
  success: (msg: string) => {
    console.log(`\x1b[32m${msg}\x1b[0m`);
  },
  info: (msg: string) => {
    console.log(`\x1b[34m${msg}\x1b[0m`);
  },
};

export default {
  sleep,
  print,
  genAbsolutePath,
  getViewPathObject,
  cleanString,
  randomNumber,
  randomChars,
};
