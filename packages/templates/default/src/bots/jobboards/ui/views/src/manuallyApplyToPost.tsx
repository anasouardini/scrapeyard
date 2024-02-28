import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  sleep,
  runServerAction,
  globalStyle,
} from 'scrapeyard/lib/viewsInterface';
import { type BotsControllers, type ProjectsControllers } from 'scrapeyard';

const style = {
  btn: {
    ...globalStyle.btn,
    margin: '20px 0 0 20px',
  },
  btnsContainer: globalStyle.btnsContainer,
};

const Controlls = ({ url }) => {
  interface Buttons {
    txt: string;
    action: (root: ProjectsControllers) => (...args: any[]) => Promise<any>;
    data: any;
  }
  const buttons: Buttons[] = [
    {
      txt: 'applied',
      action: (root) => root.jobboards.indeed.updatePostStatus,
      data: { status: 'applied' },
    },
    {
      txt: 'removed',
      action: (root) => root.jobboards.indeed.updatePostStatus,
      data: { status: 'removed' },
    },
    {
      txt: 'doesNotMatch',
      action: (root) => root.jobboards.indeed.updatePostStatus,
      data: { status: 'doesNotMatch' },
    },
  ];

  return (
    <div
      style={{
        padding: '1rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
      }}
    >
      {buttons.map(({ txt, action, data }) => {
        return (
          <button
            style={{ ...style.btn }}
            onClick={(e) => runServerAction({ action, data })}
          >
            {txt}
          </button>
        );
      })}
    </div>
  );
};

// if the controlls are already injected, don't inject again.
if (!document.querySelector('.controllsContainer')) {
  const controlsContainer = document.createElement('div');
  controlsContainer.classList.add('controllsContainer');
  document.body.insertAdjacentElement('afterbegin', controlsContainer);

  ReactDOM.createRoot(controlsContainer).render(
    <Controlls url={window.location.href} />,
  );
}
