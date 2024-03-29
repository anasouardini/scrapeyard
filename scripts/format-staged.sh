#!/bin/sh

## FORMATTING ONLY STAGED FILES (make sure this is the last one)
FILES=$(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g')
if [ ! -z "$FILES" ]; then
    # Prettify all selected files
    echo "$FILES" | xargs ./node_modules/.bin/prettier --ignore-unknown --write

    # Add the modified/prettified files back to staging
    echo "$FILES" | xargs git add
fi