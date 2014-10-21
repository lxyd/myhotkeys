#!/bin/sh

SCRIPT="$0"
pushd "$(dirname "$SCRIPT")"

VER=`grep -Go 'version\>\(.*\)\<' src/install.rdf | grep -Go '>\(.*\)<' | sed -e 's/[><]*//g'`
XPI="myhotkeys-$VER.xpi"
echo "Building $XPI ..."

# Copy base structure to a temporary build directory and move in to it
rm -rf build
mkdir build

cp -r src/* build/

pushd build

# Cleaning up unwanted files
find . -depth -name '*~' -exec rm -rf "{}" \;
find . -depth -name '#*' -exec rm -rf "{}" \;
find . -depth -name '.DS_Store' -exec rm "{}" \;
find . -depth -name 'Thumbs.db' -exec rm "{}" \;

zip -qr9XD "../$XPI" *

popd
rm -rf build
popd
