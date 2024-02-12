#!/usr/bin/env bash
#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -euxo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

BUILD_DIR="$DIR/build"
rm -rf "$BUILD_DIR" || true
mkdir -p "$BUILD_DIR"

VERSION="linux-5.10.191"
TMP="$(mktemp "/tmp/tmp.XXXXXXXX.tar.xz")"; rm "$TMP"
wget "https://cdn.kernel.org/pub/linux/kernel/v5.x/$VERSION.tar.xz" -O "$TMP"

# ---

TMPDIR="$(mktemp -d)"

# requires: build-essential libncurses-dev flex bison libssl-dev bc ca-certificates curl libelf-dev

cd "$TMPDIR"
tar -xf "$TMP"

cd "$VERSION"

cp "$DIR/.config" .
make olddefconfig
make all -j"$(nproc --all)"

mv vmlinux "$BUILD_DIR/"