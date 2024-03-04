import React from 'react';

const controllers = {
  jobboards: {
    action1: () => {
      console.log('action1 original');
    },
    obj1: {
      action12: () => {
        console.log('action12');
      },
    },
    obj2: {
      action13: () => {
        console.log('action13');
      },
    },
  },
};

function extractBotActions(bot: Record<string, any>) {
  const actions: { name: string; action: () => any }[] = [];
  function recursiveExtractor(
    parent: (() => any) | Record<string, any>,
    parentName: string,
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
      if (isActionNameTaken) {
        actions.push({
          name: `${parentName} - ${actionName}`,
          action: supposedlyAction,
        });
        return;
      }
      actions.push({ name: actionName, action: supposedlyAction });
    } else if (typeof supposedlyAction == 'object') {
      const supposedlyActions = Object.entries(
        supposedlyAction as Record<string, any>,
      );
      for (const hopefullyAction of supposedlyActions) {
        recursiveExtractor(supposedlyAction, actionName, hopefullyAction[0]);
      }
    }
  }
  recursiveExtractor({ bot }, 'BOT', 'bot');

  return actions;
}

function SideMenu() {
  function listActions(botName: string) {
    //* recursive function
    const actions = extractBotActions(controllers[botName]);
    return (
      <ul>
        {actions.map((action) => {
          return (
            <li key={action.name}>
              <button
                onClick={(e) => {
                  action.action();
                }}
              >
                {action.name}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <aside>
      <section>
        <h2>Actions</h2>
        {listActions('jobboards')}
      </section>
    </aside>
  );
}

export default SideMenu;
