import React from 'react';
import { NavLink } from 'react-router-dom';
import { botsActions } from 'scrapeyard/lib/botsUtils';
import Project from '../components/project';

function ProjectsList() {
  const style = {
    projectsList: {
      display: 'flex',
    },
  };

  function listProjects() {
    return Object.keys(botsActions).map((botName) => {
      return (
        <li>
          <NavLink
            to={`/projects/${botName}`}
            className={({ isActive }) => (isActive ? 'activeNavLink' : '')}
          >
            <Project name={botName} />
          </NavLink>
        </li>
      );
    });
  }

  return <ul style={style.projectsList}>{listProjects()}</ul>;
}

export default ProjectsList;
