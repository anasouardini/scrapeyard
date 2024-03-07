import '$/output.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './state/store';

import SharedLayout from '$home-components/sharedLayout';
import Project from '$home-ui/pages/project';
import ProjectsList from '$home-ui/pages/projectsList';
import Home from '$home-ui/pages/home';

const NotFoundPage = () => (
  <section className={'h-[100dvh] flex justify-center items-center'}>
    <p className={'text-2xl text-primary'}>Nothing To See Here (404)</p>
  </section>
);

function App() {
  return (
    <ReduxProvider store={store}>
      <MemoryRouter>
        <Routes>
          <Route path='/' element={<SharedLayout />}>
            <Route index element={<ProjectsList />} />
            <Route path='/projects' element={<ProjectsList />} />
            <Route path='/projects/:name' element={<Project />} />
            <Route path='*' element={<NotFoundPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ReduxProvider>
  );
}

ReactDOM.createRoot(document.body).render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
