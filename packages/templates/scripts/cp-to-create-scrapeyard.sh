function sanersync(){
  rsync -rvzh --perms --executability --times --progress $@
}

sanersync ./packages/templates ./packages/create-scrapyard/data/ --exclude node_modules --exclude *.test.* --exclude scripts

# 1. remove 'testOnce' field from template's package.json
# 2. remove 'lint' field from template's package.json
# 3. remove 'build' field from template's package.json
#   * this is what copies the template over to create-scrapeyard