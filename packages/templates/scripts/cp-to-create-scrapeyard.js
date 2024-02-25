const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputTemplatesPath = path.join(
  process.cwd(),
  '..',
  '..',
  'create-scrapeyard',
  'data',
  'templates',
);

const outputTemplatePackagePath = path.join(
  outputTemplatesPath,
  path.basename(process.cwd()),
  'package.json',
);

function execErrHandler(err, stdout, stderr) {
  if (err || stdout) {
    console.log({
      err,
      stderr,
    });
    return;
  }
  console.log({ output });
}

function cpCommand({ path, exclude }) {
  const excludeCommand = exclude
    .map((pattern) => `--exclude "${pattern}"`)
    .join(' ');
  return `rsync -rvzh --perms --executability --times --progress ${path.src} ${path.dest} ${excludeCommand}`;
}

function copyTemplate(dryRun) {
  const templateSrc = path.join(process.cwd());

  execSync(
    `${cpCommand({
      path: { src: templateSrc, dest: outputTemplatesPath },
      exclude: ['node_modules', '*.test.*', 'scripts'],
    })} ${dryRun === 'dry-run' ? '--dry-run' : ''}`,
    execErrHandler,
  );

  if (dryRun === 'dry-run') {
    console.log('> executed in dry-run mode; nothing has changed.');
  }
}

function getPackageInfo(packgePath) {
  const packageInfoJSON = fs.readFileSync(packgePath, 'utf-8');
  const packageInfo = JSON.parse(packageInfoJSON);
  return packageInfo;
}
function setPackageInfo(packagePath, infoObj, dryRun) {
  const packageInfoJSON = JSON.stringify(infoObj, null, '  ');

  if (dryRun === 'dry-run') {
    console.log(packageInfoJSON);
    console.log('> executed in dry-run mode, no file has been change.');
    return;
  }

  try {
    fs.writeFileSync(packagePath, packageInfoJSON, 'utf-8');
    return true;
  } catch (err) {
    console.log('Err-> ', err);
    return false;
  }
}

function replaceLibraryLink() {
  const templatePackageInfo = getPackageInfo(outputTemplatePackagePath);

  const libPath = templatePackageInfo.dependencies.scrapeyard.split(':')[1];
  const libPackageInfo = getPackageInfo(
    path.join(process.cwd(), libPath, 'package.json'),
  );

  // replace link with lib version
  templatePackageInfo.dependencies.scrapeyard = libPackageInfo.version;

  setPackageInfo(outputTemplatePackagePath, templatePackageInfo);
}

console.log('copying template over to create-scrapeyard package');
copyTemplate();
console.log('replacing "link:path" with vesion of the library');
replaceLibraryLink();
