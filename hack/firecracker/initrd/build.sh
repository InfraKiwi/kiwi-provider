#!/usr/bin/env bash
set -euxo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

BUILD_DIR="$DIR/build"
rm -rf "$BUILD_DIR" || true
mkdir -p "$BUILD_DIR"

# ---

cp -r "$DIR/src/"* "$BUILD_DIR"

BIN_DIR="$BUILD_DIR/bin"
mkdir -p "$BIN_DIR"

for bin in cat chmod chown cp cut dd find grep ls mkdir mount sed sh switch_root tr umount; do
  ln -s busybox "$BIN_DIR/$bin"
done

cp "$DIR/../busybox/build/busybox" "$BUILD_DIR/bin"
chmod +x "$BUILD_DIR/bin/"*

cd "$BUILD_DIR"

find . -print0 | cpio --null --create --verbose --format=newc > initrd.cpio