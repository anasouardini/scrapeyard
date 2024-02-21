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

declare const fakeRoot: ProjectsControllers;

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
  action: (root: ProjectsControllers) => (...args: any[]) => any;
  // actionCall: (root: ProjectsControllers) => any;
}
// controls buttons
const projects: Record<keyof ProjectsControllers, Button[]> = {
  home: [],
  // TODO: get object passed to home controller
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
                    onClick={() => {
                      runServerAction({ action, data });
                    }}
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
