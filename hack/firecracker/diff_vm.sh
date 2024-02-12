#!/usr/bin/env bash
#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -euo pipefail

IMAGE="$1"

TMP_MOUNT="$(mktemp -d)"
TMP_DIFF="$(mktemp)"
TMP_DIFF_NO_DATA="$(mktemp)"
sudo mount "$IMAGE" "$TMP_MOUNT"

trap 'catch' EXIT
catch() {
  sudo umount "$TMP_MOUNT" || true
  rm "$TMP_DIFF" || true
  #  rm "$TMP_DIFF_NO_DATA" || true
}

SNAPSHOTS_DIR="$TMP_MOUNT/.snapshots"
SNAPSHOT_NAME_PARENT="pre_build"
SNAPSHOT_NAME_CHILD="post_build"

[[ ! -d "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_CHILD" ]] && sudo btrfs subvolume snapshot -r "$TMP_MOUNT" "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_CHILD"

#sudo btrfs-diff-go "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_PARENT" "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_CHILD"

sudo btrfs send -p "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_PARENT" "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_CHILD" > "$TMP_DIFF"
sudo btrfs send --no-data -p "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_PARENT" "$SNAPSHOTS_DIR/$SNAPSHOT_NAME_CHILD" > "$TMP_DIFF_NO_DATA"

btrfs-diff "$TMP_DIFF_NO_DATA"

echo "$TMP_DIFF"
echo "$TMP_DIFF_NO_DATA"