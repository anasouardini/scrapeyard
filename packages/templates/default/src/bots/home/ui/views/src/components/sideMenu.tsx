import React from 'react';
import { botsActions } from 'scrapeyard/lib/botsUtils';
import { runServerAction } from 'scrapeyard/lib/viewsInterface';

function SideMenu() {
  function listActions(botName: keyof typeof botsActions) {
    const actions = botsActions[botName];
    return (
      <ul>
        {actions.map((action) => {
          return (
            <li key={action.name}>
              <button
                onClick={(e) => {
                  runServerAction({
                    type: 'scrapeyardEvent',
                    action: action.action,
                    data: {},
                  });
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
