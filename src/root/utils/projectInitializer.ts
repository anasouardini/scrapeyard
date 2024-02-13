import fs from "fs";
import serverVars from "./serverVars";
import tools from "./tools";

interface Node {
  type: "file" | "dir";
  name: string;
  content?: string;
  children?: Node[];
}

const options = {
  targetDir: serverVars.paths.projectsDir,
  // nodemonConfigFile: "./nodemon.json",
  dryRun: false,
};

//* adding new project dir to nodemon ignore list
// const ignoreNewDirChanges = (projectName: string) => {
//   const projectDirPath = `**/projects/${projectName}/**/*.*`;
//   const data = fs.readFileSync(options.nodemonConfigFile, "utf-8");
//   const newData = data.replace(
//     /\"ignore\".*:.*\[/i,
//     `"ignore": [\n"${projectDirPath}",`,
//   );
//   //   console.log("ignoring new dir...", newData);
//   fs.writeFileSync(options.nodemonConfigFile, newData, "utf-8");
// };

//* adding new project dir to nodemon ignore list
// const unignoreNewDirChanges = (projectName: string) => {
//   const path = `**/projects/${projectName}/**/*.*`;
//   //   var parsedPath = path.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//   var parsedPath = "projects";

//   const data = fs.readFileSync(options.nodemonConfigFile, "utf-8");
//   if (!data.includes(path)) {
//     console.error(
//       "Err -> could not find the the item was ignored befoe, this shoud never happen",
//     );
//     return;
//   }

//   //* matches the first item in ignore list (can't be more specific than that)
//   const regx = new RegExp(/"ignore"\s*:\s*\[\s*"\*\*.*",/);
//   const newData = data.replace(regx, `"ignore": [`);
//   //   console.log("unignoring new dir...", newData);
//   fs.writeFileSync(options.nodemonConfigFile, newData, "utf-8");
// };

const buildStructure = (nodes: Node, targetDir: string) => {
  //* file node
  if (nodes.type == "file") {
    const newFilePath = `${targetDir}/${nodes.name}`;
    console.log("creating file: ", newFilePath);
    if (!options.dryRun) {
      fs.writeFileSync(newFilePath, nodes?.content ?? "", "utf-8");
    }
    return;
  }

  //* dir node
  if (nodes.type == "dir") {
    const newDirPath = `${targetDir}/${nodes.name}`;
    console.log("creating dir: ", newDirPath);
    if (!options.dryRun) {
      fs.mkdirSync(newDirPath);
    }
    if (nodes.children) {
      nodes.children.forEach((node) => {
        const newTargetDir = `${targetDir}/${nodes.name}`;
        buildStructure(node, newTargetDir);
      });
    }
    return;
  }
};

export default function ({ projectName }: { projectName: string }) {
  const fsStructure: Node = {
    name: projectName,
    type: "dir",
    children: [
      {
        name: "controller",
        type: "dir",
        children: [
          {
            name: "index.ts",
            type: "file",
            content: "export default {};",
          },
        ],
      },
      {
        name: "data",
        type: "dir",
      },
      {
        name: "model",
        type: "dir",
        children: [
          {
            name: "index.ts",
            type: "file",
            content: "export default {};",
          },
          {
            name: "db.ts",
            type: "file",
            content: "",
          },
        ],
      },
      {
        name: "ui",
        type: "dir",
        children: [
          {
            name: "cp",
            type: "dir",
            children: [{ name: "index.tsx", type: "file", content: "" }],
          },
          {
            name: "views",
            type: "dir",
            children: [
              {
                name: "src",
                type: "dir",
                children: [{ name: "example.tsx", type: "file", content: "" }],
              },
              {
                name: "build",
                type: "dir",
                children: [{ name: "example.js", type: "file", content: "" }],
              },
            ],
          },
        ],
      },
      {
        name: "utils",
        type: "dir",
        children: [
          { name: "tools.ts", type: "file", content: "" },
          { name: "vars.ts", type: "file", content: "" },
        ],
      },
      {
        name: "plan",
        type: "dir",
        children: [{ name: "plan.md", type: "file", content: "" }],
      },
    ],
  };

  buildStructure(fsStructure, options.targetDir);
}
