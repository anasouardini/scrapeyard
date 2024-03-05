//@ts-ignore // this won't exist until it's used in templates
import { controllers } from './codeJoiner';
import util from 'util';
import path from 'path';
import fs from 'fs';

const vars = {
  botsUtilsName: 'botsUtils',
};

const config = {
  path: {
    botUtilsFile: `${path.join(process.cwd(), `${vars.botsUtilsName}.ts`)}`,
  },
};

function extractBotActions(bot: Record<string, any>) {
  const actions: { name: string; action: string }[] = [];
  const ancestorChain: string[] = [];

  function recursiveExtractor(
    parent: (() => any) | Record<string, any>,
    actionName: string,
  ) {
    const supposedlyAction = parent[actionName] as () =>
      | any
      | Record<string, any>;

    // if it really an action
    if (typeof supposedlyAction === 'function') {
      const isActionNameTaken = Object.values(actions).some((action) => {
        return action.name === actionName;
      });

      const actionObj = {
        name: isActionNameTaken
          ? `${ancestorChain.at(-1)} - ${actionName}`
          : actionName,
        action: `<<quote>(root) => ${ancestorChain.join('.')}.${actionName}<quote>>`,
      };

      actions.push(actionObj);
    } else if (typeof supposedlyAction == 'object') {
      const supposedlyActions = Object.entries(
        supposedlyAction as Record<string, any>,
      );
      ancestorChain.push(actionName);
      for (const hopefullyAction of supposedlyActions) {
        recursiveExtractor(supposedlyAction, hopefullyAction[0]);
      }
      ancestorChain.pop();
    }
  }
  recursiveExtractor({ root: bot }, 'root');

  return actions;
}

function genCode(actionsObj) {
  const actionsList = extractBotActions(actionsObj);
  let actionsListStr = `export const botsActions = ${util.inspect(actionsList)};`;
  actionsListStr = actionsListStr
    .replace(/'<<quote>/g, '')
    .replace(/<quote>>'/g, '');

  return actionsListStr;
}

function writeCode(code: string) {
  fs.writeFileSync(config.path.botUtilsFile, `${code}`, 'utf-8');
}

const code = genCode(controllers);
writeCode(code);
