# scrapeyard

## 0.25.0

### Minor Changes

- A "sync" command has been added that you can run whenever you make a change to the sub-projects' interface or exported types. Soon will be applied to views as well.

## 0.24.1

## 0.24.0

### Minor Changes

- Now code-gen works when you run `pnpm start`.

## 0.23.0

## 0.22.0

### Minor Changes

- Added a `npm start` command that abstracts away all the imports and updates for the sub-projects and their controllers. The start command lunches a code-gen that enumerates all user's projects and their controllers/actions and genrates a TS file that imports all of them and then passes them to the library 'scrapeyard' to run them when the dispatcher receives an action from the view injected in the browser. This came with a huge change to the ./src/index.ts the user would write.

## 0.21.0

## 0.20.0

## 0.19.0

## 0.18.0

### Minor Changes

- many issues were fixed, and create command is not more efficient.

## 0.17.3

## 0.17.2

## 0.17.1

## 0.17.0

### Minor Changes

- Now the command: `npm create scrapeyard` automatically installs dependencies and runs the demo and some enhancements has been added to the library "scrapeyard".

## 0.16.0

### Minor Changes

- packages now back to unscoped. You can now run: `npm create scrapeyard` without prepending the silly scope

## 0.15.0

### Minor Changes

- Tempalte scripts are now using default shell installed on your OS

## 0.14.0

### Minor Changes

- All templates will get moved to create-scrapeyard autoatically, i.e. run: `npm create @ouardini/scrapeyard` anytime and get the latest templates updates

## 0.13.8

## 0.13.7

## 0.13.6

## 0.13.5

## 0.13.4

## 0.13.3

## 0.13.2

### Patch Changes

- debugging

## 0.13.1

## 0.13.0

## 0.12.0

### Minor Changes

- Packages now are inside a scope

## 0.11.0

### Minor Changes

- Now the command: `pnpm create scrapeyard` simply works, it's more intuitive.

## 0.10.2

### Patch Changes

- monorepo setup is 100% ready

## 0.10.1

## 0.10.0

### Minor Changes

- Changed setup to a monorepo setup and separated bin initialization command into its own npm package.

## 0.9.3

### Patch Changes

- fixed issues in initialization command:
  `pnpx scrapeyard@latest init newProjectName`

## 0.9.2

### Patch Changes

- fixed an issue in the bin command

## 0.9.1

### Patch Changes

- fixed an issue in the intialization command:
  `pnpx scrapeyard init project-name`

## 0.9.0

### Minor Changes

- better demo project, exposed more types and other good stuff

## 0.8.1

### Patch Changes

- Got it to work first time.

## 0.8.0

### Minor Changes

- The home view is not modular: users can pass their own actions list; the data
  passed to the views now can be easily accessed through the window property
  "window.scrapeyardViewData".

## 0.7.0

### Minor Changes

- Now you can use the command `pnpm createProject` to easily start a new
  project. Also added some boilarplate in the index.ts file for better
  out-of-the-box experience.

## 0.6.0

### Minor Changes

- 55c70f8: Finally setup the template sub-package for creating a new project for
  the user along with customization to the project's metadata.
- fb04870: added a bin/cli command for initializing a project using this library
  using a single command: `npx scrapeyard init project-name`

### Patch Changes

- 1c70206: initial changeset command
- 4cb03c0: fix: package.json of the newly created project was minified by
  mistake.
- a88db26: an async method was causing an issue.
- f7cf920: reducing logic and unnecessary info.
- d37dfa1: fixed a typo in a path string.
- c281df3: fixed a typo in a path.
- 550c264: forgot to rename the bin/cli command.
- f20466d: fixed the template sub-package; now it can be used to test my library
  and be delivered to the consumer.
