import React from 'react';
import { botsActions } from 'scrapeyard/lib/botsUtils';
import { runServerAction } from 'scrapeyard/lib/viewsInterface';

interface Props {
  projectName: 'home' | 'jobboards';
}
function SideMenu(props: Props) {
  const style = {
    sideMenu: {
      height: '100%',
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
    <section>
      <aside style={style.sideMenu}>
        <h2 style={{ marginBottom: '2.5rem' }}>Actions</h2>
        {listActions(props.projectName)}
      </aside>
    </section>
  );
}

export default SideMenu;
