import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from '$ui/src/components/layout/header';
// import Header from './components/layout/header';

import controlPanels from '../../../projects/projectsControlPannels';
import { type ProjectName } from '../../../projects/projectsControlPannels';

interface State {
  currentProject: ProjectName;
}
type Action =
  | { type: 'setProject'; projectName: State['currentProject'] }
  | { type: 'nothing' };
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setProject': {
      return { currentProject: action.projectName };
    }
    case 'nothing': {
      return state;
    }
  }
};

function IndexPage() {
  const [state, dispatch] = React.useReducer(reducer, {
    currentProject: 'dreamjob',
  });

  const ProjectControlPanel = controlPanels[state.currentProject];
  const setProject = (projectName: ProjectName) => {
    // todo: update DB
    dispatch({ type: 'setProject', projectName });
  };

  return (
    <>
      <Header setProject={setProject} controlPanels={controlPanels} />
      <ProjectControlPanel />
    </>
  );
}

ReactDOM.createRoot(document.querySelector('body')!).render(<IndexPage />);
