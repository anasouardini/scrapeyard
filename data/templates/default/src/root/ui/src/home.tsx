import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  vars,
  bridge,
  sleep,
  runServerAction,
  globalStyle,
} from 'scrapeyard/lib/viewsInterface';

import { type ProjectsControllers, type Actions } from 'scrapeyard';

const myNode = document.body;

// clear default DOM
while (myNode.firstChild) {
  myNode.removeChild(myNode.firstChild);
}

// styling
document.body.style.background = '#000';
const style = {
  btn: {
    ...globalStyle.btn,
    margin: '20px 0 0 20px',
    cursor: 'pointer',
  },
  btnsContainer: globalStyle.btnsContainer,
};

const projects = window.scrapeyardViewData as Partial<Actions>;

// controls buttons
// TODO: get actions passed to home controller

function Component() {
  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            background: #000;
            color: white;
            font-size: 1.2rem;
            font-family:
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              Oxygen,
              Ubuntu,
              Cantarell,
              "Open Sans",
              "Helvetica Neue",
              sans-serif;
            font-style: sans-serif;
          }
      `}
      </style>
      <div id='controls' style={{ padding: '20px 0 0 20px' }}>
        {/* @ts-ignore */}
        {Object.keys(projects).map((projectKey: keyof typeof projects) => {
          const buttons = projects[projectKey];
          if (!buttons || !buttons.length) {
            return <>No actions were passed!</>;
          }
          return (
            <section key={projectKey}>
              <h2 style={{ marginTop: '1rem', marginBottom: '.5rem' }}>
                {projectKey}
              </h2>
              {buttons.map(({ txt, action, data }) => {
                return (
                  <button
                    onClick={() => {
                      runServerAction({ action, data });
                    }}
                    style={{
                      ...style.btn,
                      margin: 0,
                      marginRight: '1rem',
                      fontSize: '1.7rem',
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                  >
                    {txt}
                  </button>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.querySelector('body')!).render(Component());
// export default Component;
