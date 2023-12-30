#!/usr/bin/env bash
#
# (c) 2023 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

FORMAT="${FORMAT:-ext4}"

set -euxo pipefail

rm -rf /output/*

truncate -s 2G /output/image."$FORMAT"
mkfs."$FORMAT" /output/image."$FORMAT"

mount /output/image."$FORMAT" /rootfs
debootstrap --include openssh-server,nano,net-tools bookworm /rootfs http://ftp.fi.debian.org/debian
mount --bind / /rootfs/mnt

chroot /rootfs /bin/bash /mnt/script/provision.sh

umount /rootfs/mnt
umount /rootfs

ls -al /output