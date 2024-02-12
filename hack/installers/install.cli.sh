#!/usr/bin/env sh
set -e

#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

{

. './lib/lib.sh'

# shellcheck disable=SC2016
downloadUrlBase='${{ artifactsUrl }}/kiwi-cli-:nodeOs-:nodeArch-${{ artifactsLatestVersion }}'"$(kiwiGetAssetFormatExtension)"
binaryName="kiwi-cli"
installPath="$(kiwiBinInstallDir)/$binaryName"

kiwiMain () {
  kiwiDownload "$installPath" "$downloadUrlBase" "$(kiwiGetAssetFormat)"
  kiwiAddBinToPath "$binaryName"
}

# shellcheck disable=SC2068
kiwiMain $@

}