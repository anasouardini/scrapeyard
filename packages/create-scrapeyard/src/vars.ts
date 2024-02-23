import path from 'path';

const parentPath = path.join(__dirname, '..');
const templatesDir = path.join(parentPath, 'data', 'templates');
const packagejsonPath = path.join(parentPath, 'package.json');

export default {
  parentPath,
  packagejsonPath,
  templatesDir,
  // availableArgs,
};
