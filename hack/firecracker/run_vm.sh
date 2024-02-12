#!/usr/bin/env bash
#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -euo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

GUEST_HOSTNAME="${GUEST_HOSTNAME:-"debian-$(echo $RANDOM | md5sum | head -c 20)"}"

# https://github.com/firecracker-microvm/firecracker/releases
# go install github.com/firecracker-microvm/firectl@latest
FIRECRACKER_BINARY="$DIR/tool/release-v1.6.0-x86_64/firecracker-v1.6.0-x86_64"

INITRD="$DIR/initrd/build/initrd.cpio"
KERNEL="$DIR/kernel/build/vmlinux"
ROOTFS_BASE="$DIR/rootfs/build/image.btrfs"

TAP_GATEWAY_IP="172.30.0.1"
GUEST_IP="172.30.0.10"
GUEST_IP_ADDRESS_LAST_OCTET="0a" # 10

# Prepare the new image
ROOTFS="$(mktemp -p "$(dirname "$ROOTFS_BASE")" "rootfs.XXXXXXX.btrfs")"
cp "$ROOTFS_BASE" "$ROOTFS"

TMP_MOUNT="$(mktemp -d)"
sudo mount "$ROOTFS" "$TMP_MOUNT"

trap 'catch' ERR
catch() {
  sudo umount "$TMP_MOUNT" || true
}

# Configure the networking
echo "$GUEST_HOSTNAME" | sudo tee "$TMP_MOUNT/etc/hostname"
sudo tee "$TMP_MOUNT/etc/network/interfaces.d/eth0" > /dev/null <<EOF
auto eth0
allow-hotplug eth0
iface eth0 inet static
  address $GUEST_IP/24
  gateway $TAP_GATEWAY_IP
EOF

SNAPSHOTS_DIR="$TMP_MOUNT/.snapshots/"
sudo mkdir -p "$SNAPSHOTS_DIR"
SNAPSHOT_NAME="pre_build"
sudo btrfs subvolume snapshot -r "$TMP_MOUNT" "$SNAPSHOTS_DIR/$SNAPSHOT_NAME"
sudo umount "$TMP_MOUNT"

# -----

API_SOCKET="$DIR/.tmp_firecracker_socket"
rm "$API_SOCKET" || true

TAP_DEV="tap0"
# This MAC matches the TAP_GATEWAY_IP prefix
FC_MAC="02:42:ac:1E:00:$GUEST_IP_ADDRESS_LAST_OCTET"
MASK_SHORT="/24"
ETH_DEVICE="enp4s0"

# ALL HERE -----> https://gist.github.com/s8sg/1acbe50c0d2b9be304cf46fa1e832847 <-----
# Setup network interface
sudo ip link del "$TAP_DEV" 2> /dev/null || true
sudo ip tuntap add dev "$TAP_DEV" mode tap
sudo ip addr add "${TAP_GATEWAY_IP}${MASK_SHORT}" dev "$TAP_DEV"
sudo ip link set dev "$TAP_DEV" up
#TAP_MAC="$(ip a | grep -A1 tap0 | grep ether | awk '{print $2}')"

# Enable ip forwarding
sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

# Set up microVM internet access
sudo iptables -t nat -A POSTROUTING -o "$ETH_DEVICE" -j MASQUERADE
sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i "$TAP_DEV" -o "$ETH_DEVICE" -j ACCEPT

LOGFILE="$DIR/firecracker.log"

# Create log file
touch "$LOGFILE"

KERNEL_BOOT_ARGS="console=ttyS0 reboot=k panic=1 pci=off"

ARCH=$(uname -m)

if [ ${ARCH} = "aarch64" ]; then
    KERNEL_BOOT_ARGS="keep_bootcon ${KERNEL_BOOT_ARGS}"
fi

echo "Current root: $ROOTFS"

firectl \
  --firecracker-binary="$FIRECRACKER_BINARY" \
  --socket-path "$API_SOCKET" \
  --tap-device="tap0/$FC_MAC" \
  --kernel="$KERNEL" \
  --root-drive="$ROOTFS" \
  --initrd-path="$INITRD" \
  --kernel-opts="$KERNEL_BOOT_ARGS"

echo "Current root: $ROOTFS"