#! /bin/bash
#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -ex

mkdir -p ~/.ssh
cat "/mnt/assets/id_rsa.pub" >> ~/.ssh/authorized_keys

passwd -d root
mkdir /etc/systemd/system/serial-getty@ttyS0.service.d/
cat <<EOF > /etc/systemd/system/serial-getty@ttyS0.service.d/autologin.conf
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin root -o '-p -- \\u' --keep-baud 115200,38400,9600 %I $TERM
EOF

#echo 'debian-bookworm' > /etc/hostname
#cat <<EOF > /etc/network/interfaces.d/eth0
#auto eth0
#allow-hotplug eth0
#iface eth0 inet static
#  address 172.30.0.10/24
#  gateway 172.30.0.1
#EOF
