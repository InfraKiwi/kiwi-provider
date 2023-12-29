#!/usr/bin/env bash
#
# (c) 2023 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -euo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

ssh -o StrictHostKeyChecking=no -i "$DIR/rootfs/assets/id_rsa" root@172.30.0.10