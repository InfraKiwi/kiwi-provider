#!/usr/bin/env bash
set -euxo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

BUILD_DIR="$DIR/build"
rm -rf "$BUILD_DIR" || true
mkdir -p "$BUILD_DIR"

# ---

TMPDIR="$(mktemp -d)"
cd "$TMPDIR"

VERSION="busybox-1.36.1"
URL="https://busybox.net/downloads/$VERSION.tar.bz2"

wget "$URL"
tar -xf "$VERSION.tar.bz2"

# ---

cd "$VERSION"

make CONFIG_STATIC=y defconfig
make CONFIG_STATIC=y all -j"$(nproc --all)"

cp "busybox" "$BUILD_DIR/"