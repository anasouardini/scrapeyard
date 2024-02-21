# scrapeyard

## 0.7.0

### Minor Changes

- Now you can use the command `pnpm createProject` to easily start a new project. Also added some boilarplate in the index.ts file for better out-of-the-box experience.

## 0.6.0

### Minor Changes

- 55c70f8: Finally setup the template sub-package for creating a new project for the user along with customization to the project's metadata.
- fb04870: added a bin/cli command for initializing a project using this library using a single command: `npx scrapeyard init project-name`

### Patch Changes

- 1c70206: initial changeset command
- 4cb03c0: fix: package.json of the newly created project was minified by mistake.
- a88db26: an async method was causing an issue.
- f7cf920: reducing logic and unnecessary info.
- d37dfa1: fixed a typo in a path string.
- c281df3: fixed a typo in a path.
- 550c264: forgot to rename the bin/cli command.
- f20466d: fixed the template sub-package; now it can be used to test my library and be delivered to the consumer.
