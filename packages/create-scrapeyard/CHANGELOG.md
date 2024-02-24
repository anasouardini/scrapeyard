# create-scrapeyard

## 0.13.7

### Patch Changes

- fix a little issue

## 0.13.6

### Patch Changes

- debug

## 0.13.5

### Patch Changes

- fixed initialization issue

## 0.13.4

### Patch Changes

- Now, for real, `npm create scrapeyard project-name` is cross-platform

## 0.13.3

### Patch Changes

- making the creation/initialization command cross-platform

## 0.13.2

### Patch Changes

- debugging

## 0.13.1

### Patch Changes

- debugging the unintuitive npm black/white listing logic

## 0.13.0

### Minor Changes

- Some setup changes.

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

### Patch Changes

- Fixed a typo in changelog

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
