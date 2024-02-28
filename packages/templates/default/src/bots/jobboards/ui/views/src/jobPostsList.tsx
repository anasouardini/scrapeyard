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
  }
  const buttons: Buttons[] = [
    {
      txt: 'Apply queued Posts',
      action: (root) => root.jobboards.marocannonces.apply,
    },
  ];

  return (
    <>
      {buttons.map(({ txt, action }) => {
        return (
          <button
            style={{ ...style.btn }}
            onClick={(e) => runServerAction({ action, data: { url } })}
          >
            {txt}
          </button>
        );
      })}
    </>
  );
};

(async () => {
  const postsContainer = document.querySelector('ul.cars-list');
  if (!postsContainer) {
    console.log('Err -> posts list not found');
    return;
  }

  Array.from(postsContainer.children).forEach((postLi) => {
    if (postLi.classList.contains('adslistingpos')) {
      postLi.remove();
      console.log('removed an ad');
      return;
    }

    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('controllsContainer');
    postLi.insertAdjacentElement('afterbegin', controlsContainer);

    const url = postLi.querySelector('a');
    if (!url) {
      console.log('Err -> cant extract post link');
      return;
    }

    const postObj = {
      title: url.title,
      url: url.href,
    };

    ReactDOM.createRoot(controlsContainer).render(
      <Controlls url={postObj.url} />,
    );
  });
})();
