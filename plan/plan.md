## short-term TODO
### code-gen
  - library needs to ue serverVars.controllers instea of the old projectsControllers.ts
### library clean-up
  - root's controllers and views are like any other project copy them over
  - root/data dir is storing user's projects data, create it inside node_modules
    - node_moules/scrapeyard/data  should contain all logs and data
      like FSTreeState and buildlogs.json
  - root/ui is unnecessary and the view utils there should moved to root/utils
  - remove template-dev-related scipts from copied package.json to create-scrapeyard

