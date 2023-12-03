#!/usr/bin/env sh
set -e

configProviderUrl='{{ configProviderUrl }}'
downloadUrl='{{ downloadUrl }}'

agentInstallDir='/opt/10infra'
agentInstallPath="$agentInstallDir/agent"

mkdir -p "$agentInstallDir"

download_agent() {
  if command -v curl >/dev/null; then
    curl -f -L -o "$agentInstallPath" "$downloadUrl"
    return
  fi

  if command -v wget >/dev/null; then
    wget -O "$agentInstallPath" "$downloadUrl"
    return
  fi

  echo "The 10infra installer requires at least curl or wget."
  exit 1
}

download_agent
chmod +x "$agentInstallPath"

"$agentInstallPath" bootstrap --url "$configProviderUrl" --installDir "$agentInstallDir"