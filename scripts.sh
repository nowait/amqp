#!/bin/bash

flags="-it -v $(pwd):/src -w /src"

function install {
  if docker --version > /dev/null 2>&1; then
    docker run $flags nowait/node:5.11.1-npm-alpine install
  else
    echo "Error 'docker' command not found.  If you are attempting to run npm install inside the check status app container, you are using this incorrectly.  Must be run from your host machine."
  fi
}

function build {
    docker run $flags nowait/node:5.11.1-base-alpine ./node_modules/.bin/babel -D -d build src
}

function lint {
docker run $flags nowait/node:5.11.1-base-alpine ./node_modules/.bin/jsinspect -t 35 src && ./node_modules/.bin/jsinspect --identifiers -t 35 test && ./node_modules/.bin/eslint src test migrations
}

function typecheck {
  if docker --version > /dev/null 2>&1; then
    docker run -i -v $(pwd):/app rezzza/docker-flow:0.23.1
  else
    echo "Error 'docker' command not found.  If you are attempting to run flow inside the check status app container, you are using this incorrectly.  Must be run from your host machine."
  fi
}

function unit-test {
    docker run $flags nowait/node:5.11.1-base-alpine ./node_modules/.bin/mocha test
}

function coverage {
    docker run $flags nowait/node:5.11.1-base-alpine ./node_modules/.bin/babel-node ./node_modules/.bin/isparta cover --report cobertura --root src ./node_modules/.bin/_mocha -- test/ --no-deprecation
}

function ci {
    flags="-i -v /home/ubuntu/jenkins/mount/jobs/amqp/workspace:/src -w /src"
    install && lint && typecheck && coverage
}

$@

