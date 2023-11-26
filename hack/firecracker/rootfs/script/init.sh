#!/usr/bin/env bash
set -euxo pipefail

rm -rf /output/*

truncate -s 256M /output/image.btrfs
mkfs.btrfs /output/image.btrfs

mount /output/image.btrfs /rootfs
debootstrap --include openssh-server,nano,net-tools bookworm /rootfs http://ftp.debian.org/debian/
mount --bind / /rootfs/mnt

chroot /rootfs /bin/bash /mnt/script/provision.sh

umount /rootfs/mnt
umount /rootfs

ls -al /output