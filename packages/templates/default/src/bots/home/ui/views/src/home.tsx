import React from 'react';
import ReactDOM from 'react-dom/client';
import '$/output.css';

import {
  type ProjectsControllers,
  type HomeButtons,
  type HomeButton,
} from 'scrapeyard';
// import Header from '$home/components/header';
import SharedLayout from '$home-components/sharedLayout';
import Project from '$home-ui/pages/project';

const myNode = document.body;
// clear default DOM
while (myNode.firstChild) {
  myNode.removeChild(myNode.firstChild);
}

function Component() {
  return (
    <>
      <SharedLayout>
        <Project />
      </SharedLayout>
    </>
  );
}

ReactDOM.createRoot(document.querySelector('body')!).render(Component());
//
