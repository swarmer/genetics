#!/bin/sh

APP_NAME=genetics-api
branch=$(git rev-parse --abbrev-ref HEAD)

git archive --format zip --prefix "${APP_NAME}/" --output docker/build/${APP_NAME}.zip "$branch"
