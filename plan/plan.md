## docs
- commands first; common questions first.

## code-gen
- library needs to use serverVars.controllers instead of the old projectsControllers.ts
- type HomeButtons has to be stricter, "root"'s type has to only allow project-specific methods
- runServerActions in the views needs a generic type for updated projects list (BotsConttrollers)

## library

### refactor
- move /lib/* to the root of the library so you can import from 'scrapeyard/module'
- codeJoiner can stay in /lib or /bin and still run inside template
- botsUtils can be added to the library and be imported from 'scrapeyard/botsUtils'

### clean-up
- root's controllers and views are like any other project copy them over
- root/data dir is storing user's projects data, create it inside node_modules
  - node_moules/scrapeyard/data  should contain all logs and data
    like FSTreeState and buildlogs.json
- root/ui is unnecessary and the view utils there should moved to root/utils
- remove template-dev-related scipts from copied 'package.json' to create-scrapeyard

## create-scrapeyard
- reduce create-scrapeyard size; it's larger than the actual library 😱
  - you don't need fs-extra
  - colors can be done easily without a library
  - same for prompting the user input
  - ignore DB files

## templates
- rsync command should delete files from destination if it's has been removed from src
- demo project's db should be initialized/migrated automatically on project lunch
