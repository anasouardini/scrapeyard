import path from 'path';
import fs from 'fs';

import vars from './vars';

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
};
