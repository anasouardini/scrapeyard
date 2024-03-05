import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  type ProjectsControllers,
  type HomeButtons,
  type HomeButton,
} from 'scrapeyard';
// import Header from '$home/components/header';
import Header from '$home-components/header';
import SideMenu from '$home-components/sideMenu';
import BotControlPanel from '$home-components/botControlPanel';

const myNode = document.body;
// clear default DOM
while (myNode.firstChild) {
  myNode.removeChild(myNode.firstChild);
}

function Component() {
  return (
    <div>
      <Header />
      <main>
        <SideMenu />
        <BotControlPanel name='jobboards' />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.querySelector('body')!).render(Component());
