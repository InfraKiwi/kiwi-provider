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