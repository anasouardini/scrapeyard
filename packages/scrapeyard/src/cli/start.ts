import genCodeJoiner from './codeGen';
import genBotsActions from './botsActionsGen';

// creates the initial TS file that would start the server
const codeJoinerPath = genCodeJoiner();
console.log(codeJoinerPath);

// create bots actions list
const botsActionsPath = genBotsActions();
console.log(botsActionsPath);
