import React from 'react';
import { botsActions } from '$/../botsUtis';

function SideMenu() {
  function listActions(botName: string) {
    const actions = botsActions;
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
