import { botsActions } from './botsUtils';
import util from 'util';

function extractBotActions(bot: Record<string, any>) {
  const actions: { name: string; action: string }[] = [];
  const ancestorChain: string[] = ['root'];

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
        action: ancestorChain.join('.') + `.${actionName}`,
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
    }
  }
  recursiveExtractor({ bot }, 'root');

  return actions;
}

function writeCode() {
  const actionsList = extractBotActions(botsActions);
  const actionsListStr = util.inspect(actionsList);
  console.log({ actionsListStr });
}

export default function () {
  writeCode();
  return 'path not created yet!';
}
