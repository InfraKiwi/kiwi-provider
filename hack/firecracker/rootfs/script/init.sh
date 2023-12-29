#!/usr/bin/env bash
#
# (c) 2023 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

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