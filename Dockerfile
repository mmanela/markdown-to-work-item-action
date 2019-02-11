FROM node:10-slim

LABEL "com.github.actions.name"="Markdown to Azure Boards work items"
LABEL "com.github.actions.description"="Converts markdown lines into Azure Boards work items."
LABEL "com.github.actions.icon"="clipboard"
LABEL "com.github.actions.color"="blue"

LABEL "version" = "0.0.1"
LABEL "repository"="http://github.com/mmanela/markdown-to-work-item-action"
LABEL "homepage"="http://github.com/mmanela/markdown-to-work-item-action"
LABEL "maintainer"="Matthew Manela"

RUN apt-get update -qq && apt-get install -qqy --no-install-recommends \
  git \
&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY entrypoint.sh index.js /
#COPY data/ data/

RUN chmod +x /entrypoint.sh 

ENTRYPOINT ["/entrypoint.sh"]