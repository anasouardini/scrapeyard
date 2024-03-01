import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  type ProjectsControllers,
  type HomeButtons,
  type HomeButton,
} from 'scrapeyard';
import Header from './components/header';
import SideMenu from './components/sideMenu';
import BotControlPanel from './components/botControlPanel';

const myNode = document.body;
// clear default DOM
while (myNode.firstChild) {
  myNode.removeChild(myNode.firstChild);
}

function Component() {
  return (
    <>
      <Header />
      <main>
        <SideMenu />
        <BotControlPanel name='jobboards' />
      </main>
    </>
  );
}

ReactDOM.createRoot(document.querySelector('body')!).render(Component());
