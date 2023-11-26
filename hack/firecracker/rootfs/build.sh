#!/usr/bin/env bash
set -euxo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

FSDIR="$(mktemp -d)"
echo "Tmp dir: $FSDIR"

trap 'catch' ERR
catch() {
  echo "Deleting tmp dir $FSDIR"
  rm -rf "$FSDIR"
}

TAG="firecracker-build-debian-bookworm"
docker build -t "$TAG" -f "$DIR/Dockerfile" "$DIR"
docker run --privileged -it --rm -v "$FSDIR":/output "$TAG"

ls -al "$FSDIR"
echo "Built at $FSDIR"

mkdir -p "$DIR/build"
mv "$FSDIR/"* "$DIR/build/"
sudo chown -R "$USER" "$DIR/build/"

rm -rf "$FSDIR"