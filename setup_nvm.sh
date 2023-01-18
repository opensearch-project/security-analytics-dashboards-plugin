#!/bin/bash

##########################################################################
# Added a shell wrapper script over the python start_version_release.py to make
# calling it from the TodWorker, easier.
# It accepts the script arguments as PARAMS and executes the dprelease module
##########################################################################
# flake8: noqa

# Flags to build NVM
EXPECTED_NVM_VERSION=$1
# For OSD: 0.34.0
EXPECTED_NODE_VERSION=$2
# For OSD: v14.20.0

# shellcheck disable=SC1009
if [ -z "$EXPECTED_NVM_VERSION" ] || [ -z "$EXPECTED_NODE_VERSION" ]; then
    echo "EXPECTED_NVM_VERSION: $EXPECTED_NVM_VERSION or EXPECTED_NODE_VERSION: $EXPECTED_NODE_VERSION is missing, Exiting!"
    exit 1
fi

echo "Using $PACKAGE_ROOT as root"
if [ -z "$PACKAGE_ROOT" ]; then
    echo "PACKAGE_ROOT was not specified by the calling script"
    exit 1
fi

# shellcheck disable=SC2034
NVM_PATH="/local/nvm"
# shellcheck disable=SC2034
# shellcheck disable=SC2006
NVM_VERSION=`nvm --version 2> /dev/null`
echo "NVM Version: $NVM_VERSION"
if [ -z "$NVM_VERSION" ] || [ "$NVM_VERSION" != "$EXPECTED_NVM_VERSION" ]; then
    echo "NVM Path: $NVM_PATH"
    if [ -d $NVM_PATH ]; then
        echo "NVM_PATH: $NVM_PATH exists! Deleting"
        yes | sudo rm -rf $NVM_PATH
    fi
    echo "Creating NVM Path: $NVM_PATH; sudo mkdir -p $NVM_PATH"
    sudo mkdir -p $NVM_PATH
    BACKUP_HOME=$HOME
    HOME=$NVM_PATH
    # shellcheck disable=SC2034
    METHOD="git"
    # shellcheck disable=SC2140
    echo "Running: sudo chown -R $USER:"amazon" $HOME"
    # shellcheck disable=SC1083
    sudo chown -R "$USER":"amazon" $HOME
    echo "Running: sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v$EXPECTED_NVM_VERSION/install.sh | zsh"
    yes | sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v"$EXPECTED_NVM_VERSION"/install.sh | zsh
    echo "Running: source $HOME/.zshrc"
    source $HOME/.zshrc
    HOME=$BACKUP_HOME
else
    echo "Running: source $NVM_PATH/.zshrc"
    source $NVM_PATH/.zshrc
fi

# Setting up node
# shellcheck disable=SC2034
# shellcheck disable=SC2006
NVM_VERSION=`nvm --version`
echo "After Setting NVM Version: $NVM_VERSION"

echo "Running: sudo nvm use --delete-prefix $EXPECTED_NODE_VERSION"
nvm install "$EXPECTED_NODE_VERSION"
nvm use --delete-prefix "$EXPECTED_NODE_VERSION"
npm config delete prefix
npm config set prefix $NVM_DIR/versions/node/$EXPECTED_NODE_VERSION

# shellcheck disable=SC2006
# shellcheck disable=SC2034
NODE_VERSION=`node --version`
echo "Node Version: $NODE_VERSION"
# shellcheck disable=SC2236
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" != "$EXPECTED_NODE_VERSION" ]; then
    echo "Node Version: $NODE_VERSION does not match with Expected Node Version: $EXPECTED_NODE_VERSION"
    exit 1
fi

# Setting up npm
# shellcheck disable=SC2006
# shellcheck disable=SC2034
NPM_VERSION=`npm --version`
echo "NPM Version: $NPM_VERSION"
if [ -z "$NPM_VERSION" ]; then
    echo "NPM Version: $NPM_VERSION is Null"
    exit 1
fi

# Setting up yarn
echo "Setting up yarn!"
echo "sudo npm i -g yarn"
sudo npm i -g yarn

if [ $? == 1 ]; then
    echo "npm i -g yarn failed!"
    exit 1
fi