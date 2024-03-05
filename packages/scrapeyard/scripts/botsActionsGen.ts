//@ts-ignore // this won't exist until it's used in templates
import { controllers } from './codeJoiner';
import util from 'util';
import path from 'path';
import fs, { unlinkSync } from 'fs';
import { execSync } from 'child_process';

const vars = {
  botsUtilsName: 'botsUtils',
  libName: 'scrapeyard',
};

const config = {
  paths: {
    libraryLibPath: path.join(
      process.cwd(),
      'node_modules',
      vars.libName,
      'lib',
    ),
    outputDir: path.join(process.cwd()),
    projectDirFromCodeJoinerFile: '.',
    projectBotsDir: path.join(process.cwd(), 'src', 'bots'),
    botUtilsFile: `${path.join(process.cwd(), `${vars.botsUtilsName}.ts`)}`,
  },
};
config.paths.botUtilsFile = path.join(
  config.paths.libraryLibPath,
  `${vars.botsUtilsName}.ts`,
);

function extractBotActions(bot: Record<string, any>) {
  const actions: { name: string; action: string }[] = [];
  const ancestorChain: string[] = [];

  function recursiveExtractor(
    parent: (() => any) | Record<string, any>,
    actionName: string,
  ) {
    const supposedlyAction = parent[actionName] as () =>
      | any
      | Record<string, any>;

    // if it really an action
    if (typeof supposedlyAction === 'function') {
      const isActionNameTaken = Object.values(actions).some((action) => {
        return action.name === actionName;
      });

      const actionObj = {
        name: isActionNameTaken
          ? `${ancestorChain.at(-1)} - ${actionName}`
          : actionName,
        action: `<<quote>(root) => ${ancestorChain.join('.')}.${actionName}<quote>>`,
      };

      actions.push(actionObj);
    } else if (typeof supposedlyAction == 'object') {
      const supposedlyActions = Object.entries(
        supposedlyAction as Record<string, any>,
      );
      ancestorChain.push(actionName);
      for (const hopefullyAction of supposedlyActions) {
        recursiveExtractor(supposedlyAction, hopefullyAction[0]);
      }
      ancestorChain.pop();
    }
  }
  recursiveExtractor({ root: bot }, 'root');

  return actions;
}

function genCode(actionsObj) {
  const parsedActionsObj = {};
  for (const botName of Object.keys(actionsObj)) {
    parsedActionsObj[botName] = extractBotActions({
      [botName]: actionsObj[botName],
    });
  }
  let actionsListStr = `export const botsActions = ${util.inspect(parsedActionsObj)};`;
  actionsListStr = actionsListStr
    .replace(/'<<quote>/g, '')
    .replace(/<quote>>'/g, '');

  return actionsListStr;
}

function genTypes() {
  try {
    console.log('> syncing types');
    // generate a config file for 'tsc' (doesn't ignore the one that exists)
    const tmpTsconfigObj = {
      compilerOptions: {
        target: 'esNext',
        lib: ['es6'],
        outDir: config.paths.libraryLibPath,
        module: 'CommonJS',
        allowJs: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        noImplicitAny: false,
        skipLibCheck: true,
        moduleResolution: 'node',
        declaration: true,
      },
      include: [config.paths.botUtilsFile],
      // exclude: [`${config.paths.outputDir}/src`],
    };
    const tmpTsconfigFileName = `${vars.botsUtilsName}.config.json`;
    const tmpTsconfigFile = `${config.paths.libraryLibPath}/${tmpTsconfigFileName}`;
    fs.writeFileSync(tmpTsconfigFile, JSON.stringify(tmpTsconfigObj));
    // console.log({ codeJoinerPath });
    console.log(`> generating declaration files`);
    execSync(`tsc -p "${tmpTsconfigFile}";`);
  } catch (err) {
    console.log(
      `Err -> could not generate types for ${vars.botsUtilsName}:\n${err}`,
    );
    return;
  }
}

function writeCode(code: string) {
  fs.writeFileSync(config.paths.botUtilsFile, `${code}`, 'utf-8');
}

const code = genCode(controllers);
// genTypes();
// unlinkSync(config.paths.botUtilsFile);
writeCode(code);
