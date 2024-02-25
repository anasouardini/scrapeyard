#!/bin/env sh

currentDirName=${PWD##*/}
# ls -la  "../../create-scrapeyard/data/templates/$currentDirName/"
# command rm -rf  "../../create-scrapeyard/data/templates/$currentDirName/"
mkdir -p "../../create-scrapeyard/data/templates/$currentDirName/"
rsync -rvzh --perms --executability --times --progress . "../../create-scrapeyard/data/templates/$currentDirName/" --exclude node_modules --exclude '*.test.*' --exclude scripts
 
## PARSE PACKAGE.JSON AFTER COPY
# 1. remove 'testOnce' field from template's package.json
# 2. remove 'lint' field from template's package.json
# 3. remove 'build' field from template's package.json
#   * this is what copies the template over to create-scrapeyard