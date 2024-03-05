#!/usr/bin/env bash

function run(){
    ts-node -P "./node_modules/scrapeyard/bin/tsconfig.bin.json"  -T  $@
}

function runHere(){
    cat $1 | ts-node -P "./node_modules/scrapeyard/bin/tsconfig.bin.json" -T
}

# run codeGen (lib bin command)
run "./node_modules/scrapeyard/bin/scripts/codeGen.ts"

# run actionsListGen
runHere "./node_modules/scrapeyard/bin/scripts/botsActionsGen.ts"