import { execSync } from 'child_process';
import genCodeJoiner from './codeGen';

// creates the initial TS file that would start the server
const codeJoinerPath = genCodeJoiner();

console.log(codeJoinerPath);
// execSync(`ts-node -T '${codeJoinerPath}'`);
