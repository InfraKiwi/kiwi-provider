#!/usr/bin/env sh
#
# (c) 2023 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

set -e

configProviderUrl='{{ configProviderUrl }}'
downloadUrlBase='{{ downloadUrl }}'

agentInstallDir='/opt/10infra'
agentInstallPath="$agentInstallDir/agent"

# Parse args
# Some ref: https://sgeos.github.io/sh/freebsd/2017/01/25/straightforward_shell_script_command_line_argument_parsing.html
setDefaults() {
  argForce=false
}

parseArgs() {
  setDefaults
  safeDelimiter="$(printf "\a")"
  while [ "$1" != "" ]
  do
    param=$(echo $1 | cut -f1 -d=)
    value=$(echo $1 | sed "s/=/${safeDelimiter}/" | cut -f2 "-d${safeDelimiter}")

    case $param in
      --force)
        argForce="${value}"
        ;;
      *)
        echo "ERROR: Unknown parameter ${param}"
        exit 1
        ;;
    esac
    shift
  done
}

main () {
  # shellcheck disable=SC2068
  parseArgs $@

  # Detect os/arch
  # Some ref: https://github.com/nvm-sh/nvm/blob/e6fa80cb6178ff4e9735265281b5eae811f05f11/nvm.sh#L1920
  nodeOs=
  case $(uname | tr '[:upper:]' '[:lower:]') in
    linux*) nodeOs=linux ;;
    darwin*) nodeOs=darwin ;;
    *) echo "Unsupported OS"; exit 1 ;;
  esac

  hostArch="$(command uname -m)"
  nodeArch=
  case "$hostArch" in
    x86_64|amd64) nodeArch=x64 ;;
    aarch64) nodeArch=arm64 ;;
    *) nodeArch="${hostArch}" ;;
  esac

  downloadUrl="${downloadUrlBase}/${nodeOs}/${nodeArch}"

  mkdir -p "$agentInstallDir"

  download_agent() {
    if command -v curl >/dev/null; then
      echo "Downloading agent using curl from $downloadUrl into $agentInstallPath"
      curl -f -L -o "$agentInstallPath" "$downloadUrl"
      return
    fi

    if command -v wget >/dev/null; then
      echo "Downloading agent using wget from $downloadUrl into $agentInstallPath"
      wget -O "$agentInstallPath" "$downloadUrl"
      return
    fi

    echo "The 10infra installer requires at least curl or wget."
    exit 1
  }

  download_agent
  chmod +x "$agentInstallPath"

  extraArgs=
  if [ "$argForce" = "true" ]; then
    extraArgs="$extraArgs --force"
  fi

  # shellcheck disable=SC2086
  "$agentInstallPath" bootstrap --url "$configProviderUrl" --installDir "$agentInstallDir" $extraArgs
}

# shellcheck disable=SC2068
main $@