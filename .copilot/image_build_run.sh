#!/usr/bin/env bash

# Exit early if something goes wrong
set -e

# Add commands below to run inside the container after all the other buildpacks have been applied
if [ "$NODE_ENV" = "production" ]; then
  NODE_ENV=production grunt generate-assets
fi
