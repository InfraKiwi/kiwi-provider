#!/usr/bin/env sh
set -e

#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

{

. './lib/lib.sh'

kiwiProviderUrl='{{ kiwiProviderUrl }}'
downloadUrlBase="{{ downloadUrl }}/:nodeOs/:nodeArch/$(kiwiGetAssetFormat)"

binaryName="kiwi-agent"
installPath="$(kiwiBinInstallDir)/$binaryName"

kiwiSetDefaults() {
  argForce=false
}

kiwiSetArgument() {
  param="$1"
  value="$2"

  case $param in
    --force)
      argForce="${value}"
      ;;
    *)
      echo "ERROR: Unknown parameter ${param}"
      exit 1
      ;;
  esac
}

kiwiMain () {
  # shellcheck disable=SC2068
  kiwiParseArgs $@

  kiwiDownload "$installPath" "$downloadUrlBase" "$(kiwiGetAssetFormat)"
  kiwiAddBinToPath "$binaryName"

  extraArgs=
  if [ "$argForce" = "true" ]; then
    extraArgs="$extraArgs --force"
  fi

  # shellcheck disable=SC2086
  "$installPath" bootstrap --url "$kiwiProviderUrl" --installDir "$(kiwiInstallDir)" $extraArgs
}

# shellcheck disable=SC2068
kiwiMain $@

}