import React from "react";
import ReactDOM from "react-dom/client";
import vars from "./viewUtils/viewsVars";
import bridge from "./viewUtils/bridge";

import {
  sleep,
  runServerAction,
  globalStyle,
  projectsControllers,
} from "./viewUtils/common";
import { ProjectsControllers } from "../../../projects/projectsControllers";

const myNode = document.body;
// clear default DOM
while (myNode.firstChild) {
  myNode.removeChild(myNode.firstChild);
}
// Array.from(document.body.children).forEach((child) => {
//   child.remove();
// });
document.body.style.background = "#000";

const style = {
  btn: {
    ...globalStyle.btn,
    margin: "20px 0 0 20px",
    cursor: "pointer",
  },
  btnsContainer: globalStyle.btnsContainer,
};

interface Button {
  txt: string;
  data: any;
  action: (root: ProjectsControllers) => (args: any) => any;
}
// controls buttons
const projects: Record<keyof ProjectsControllers, Button[]> = {
  home: [],
  dreamjob: [
    {
      txt: "collect companies",
      action: (root) => root.dreamjob.company.collect,
      data: {},
    },
    {
      txt: "get companies metadata",
      action: (root) => root.dreamjob.company.getMetaData,
      data: {},
    },
    {
      txt: "collect decision makers",
      action: (root) => root.dreamjob.company.collectDecisionMakers.start,
      data: {},
    },
    {
      txt: "connect with decision makers",
      action: (root) => root.dreamjob.connection.start,
      data: {},
    },
    //? maybe add those old connection request to a list if they don't exist in the employees table
    // {
    //   txt: "clean old pending connections",
    //   action: (root)=>root.dreamjob.connection.clean,
    //   data: {},
    // }, // not implemented
    // {
    //   txt: "check connections acceptance",
    //   action: (root)=>root.dreamjob.connection.check,
    //   data: {},
    // }, // not implemented
    {
      txt: "job requests",
      action: (root) => root.dreamjob.company.sendJobRequests.start,
      data: {},
    },
  ],
  jobboardsMarocAnnonces: [
    {
      txt: "collect",
      action: (root) => root.jobboards.marocannonces.collect,
      data: {},
    },
    {
      txt: "parse",
      action: (root) => root.jobboards.marocannonces.parse,
      data: {},
    },
    {
      txt: "find matches",
      action: (root) => root.jobboards.marocannonces.findMatches,
      data: {},
    },
    {
      txt: "apply",
      action: (root) => root.jobboards.marocannonces.apply,
      data: {},
    },
  ],
  jobboardsIndeed: [
    {
      txt: "collect",
      action: (root) => root.jobboards.indeed.collect,
      data: {},
    },
    {
      txt: "find matches",
      action: (root) => root.jobboards.indeed.findMatches,
      data: {},
    },
    {
      txt: "apply",
      action: (root) => root.jobboards.indeed.apply,
      data: {},
    },
  ],
  frugalads: [
    {
      txt: "frugalads-chatiwus",
      action: (root) => root.frugalads.chatiwus.lunchInstance,
      data: {},
    },
  ],
  socialboost: [
    {
      txt: "reddit hunt",
      action: (root) => root.socialboost.reddit.hunt,
      data: {},
    },
    {
      txt: "twiter hunt",
      action: (root) => root.socialboost.twitter.hunt,
      data: {},
    },
  ],
};

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
      <div id="controls" style={{ padding: "20px 0 0 20px" }}>
        {Object.keys(projects).map((projectKey: keyof typeof projects) => {
          const buttons = projects[projectKey];
          if (!buttons.length) {
            return <></>;
          }
          return (
            <section key={projectKey}>
              <h2 style={{ marginTop: "1rem", marginBottom: ".5rem" }}>
                {projectKey}
              </h2>
              {buttons.map(({ txt, action, data }) => {
                return (
                  <button
                    onClick={() => runServerAction({ action, data })}
                    style={{
                      ...style.btn,
                      margin: 0,
                      marginRight: "1rem",
                      fontSize: "1.7rem",
                      fontWeight: "bold",
                      color: "black",
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

ReactDOM.createRoot(document.querySelector("body")!).render(Component());
// export default Component;
