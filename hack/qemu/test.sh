#!/usr/bin/env bash

#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -euo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

TMP_FS="$(mktemp)"
rm "$TMP_FS"

trap 'catch' ERR
catch() {
  echo "Deleting tmp fs $TMP_FS"
  rm -rf "$TMP_FS"
}

SRC="$DIR/rootfs/build/image.ext4"
#INITRD="$DIR/initrd/build/ubuntu-21.04-server-cloudimg-amd64-initrd-generic"
INITRD="$DIR/initrd/build/initrd.cpio"
KERNEL="$DIR/kernel/build/bzImage"
#KERNEL="$DIR/kernel/build/ubuntu-21.04-server-cloudimg-amd64-vmlinuz-generic"

SRC_UBUNTU="$DIR/rootfs/build/ubuntu-21.04-server-cloudimg-amd64-disk-kvm.img"
#qemu-img create -f qcow2 -b "$SRC_UBUNTU" -F qcow2 "$TMP_FS"
qemu-img create -f qcow2 -b "$SRC" -F raw "$TMP_FS"

echo "Starting"

qemu-system-x86_64 \
   -enable-kvm -cpu host -m 512m -smp 2 \
   -kernel "$KERNEL" \
   -append "earlyprintk=ttyS0 console=ttyS0 root=/dev/sda net.ifnames=0 nokaslr" \
   -initrd "$INITRD" \
   -nodefaults -no-user-config -nographic \
   -serial stdio \
   -drive file="$TMP_FS",format=qcow2 \
   -netdev user,id=network0,hostfwd=tcp::5555-:22 -device e1000,netdev=network0,mac=52:54:00:12:34:56

#
#   -device virtio-blk-device,drive=test \
#   -M microvm,x-option-roms=off,pit=off,pic=off,rtc=off \
#   -drive id=test,file="$TMP_FS",format=qcow2,if=none \\
                                                        #   -netdev tap,id=tap0,script=no,downscript=no \
                                                        #   -device virtio-net-device,netdev=tap0


# ssh -i rootfs/assets/id_rsa -p 5555 -o "StrictHostKeyChecking no" root@localhost -v