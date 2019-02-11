#!/bin/bash
set -e 

if [ -z "$AZURE_BOARDS_ORGANIZATION" ]; then
    echo "AZURE_BOARDS_ORGANIZATION is not set." >&2
    exit 1
fi

if [ -z "$AZURE_BOARDS_PROJECT" ]; then
    echo "AZURE_BOARDS_PROJECT is not set." >&2
    exit 1
fi

if [ -z "$AZURE_BOARDS_TOKEN" ]; then
    echo "AZURE_BOARDS_TOKEN is not set." >&2
    exit 1
fi

if [ -z "$GITHUB_EVENT_PATH" ]; then
    echo "GITHUB_EVENT_PATH is not set." >&2
    exit 1
fi

# Some Helper Functions
_git_is_dirty() {
	[[ -n "$(git status -s)" ]]
}

_commit() {
    git config user.name "${GITHUB_ACTOR}"
    git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
	git add .
	git commit -m "GitHub Action: Link docs to Azure Boards Work Items"
}

_commit_if_needed() {
	if _git_is_dirty; then
		_commit
	fi
}

# Run the node app to linkify markdown
node ../../index.js

# Only needed when testing
#cd data
#git init

# Commit if dirty
_commit_if_needed