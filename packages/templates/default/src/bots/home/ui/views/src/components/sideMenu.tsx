import React from 'react';
import { botsActions } from 'scrapeyard/lib/botsUtils';
import { runServerAction } from 'scrapeyard/lib/viewsInterface';

function SideMenu() {
  const style = {
    sideMenu: {
      position: 'fixed',
      top: 0,
      right: 0,
      height: 'calc(100vh - 30px)',
      width: '400px',
      zIndex: 2,
    },
    actionsList: {
      dispaly: 'flex',
      flexDirection: 'column',
    },
    btn: {
      border: `solid 2px var(--clr-accent)`,
      borderRadius: '4px',
      paddingInline: '1rem',
      paddingBlock: '.4rem',
      background: 'var(--clr-accent)',
    },
  };

  function listActions(botName: keyof typeof botsActions) {
    const actions = botsActions[botName];
    return (
      <ul>
        {actions.map((action) => {
          return (
            <li key={action.name} className='gap-y'>
              <button
                style={style.btn}
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
      <section style={style.sideMenu}>
        <h2 style={{ marginBottom: '2.5rem' }}>Actions</h2>
        {listActions('jobboards')}
      </section>
    </aside>
  );
}

export default SideMenu;
