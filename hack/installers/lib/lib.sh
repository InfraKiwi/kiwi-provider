#!/usr/bin/env sh

#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

kiwiPrint() {
  command printf %s\\n "$*" 2>/dev/null
}

kiwiInstallDir() {
  installDir="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.kiwi" || printf %s "${XDG_CONFIG_HOME}/kiwi")"
  mkdir -p "$installDir"
  printf %s "$installDir"
}

kiwiBinInstallDir() {
  binInstallDir="$(kiwiInstallDir)/bin"
  mkdir -p "$binInstallDir"
  printf %s "$binInstallDir"
}

kiwiCheckType() {
  type "$1" > /dev/null 2>&1
}

kiwiCheckCommand() {
  command -v "$1" > /dev/null 2>&1
}

kiwiSupportsGz() {
  kiwiCheckCommand gzip
}

kiwiGetAssetFormat() {
  format=raw
  if kiwiCheckCommand gzip; then
    format=gz
  fi
  printf %s "$format"
}

kiwiGetAssetFormatExtension() {
  extension=
  if kiwiCheckCommand gzip; then
    extension=".gz"
  fi
  printf %s "$extension"
}

# Parse args
# Some ref: https://sgeos.github.io/sh/freebsd/2017/01/25/straightforward_shell_script_command_line_argument_parsing.html
# Usage:
#  kiwiSetArgument() {
#    param="$1"
#    value="$2"
#  }
#  kiwiSetDefaults() {
#    argForce=false
#  }
kiwiParseArgs() {
  if ! kiwiCheckType "kiwiSetArgument"; then
    kiwiPrint "Undefined kiwiSetArgument function"
    exit 1
  fi
  kiwiCheckType "kiwiSetDefaults" && kiwiSetDefaults
  safeDelimiter="$(printf "\a")"
  while [ "$1" != "" ]
  do
    param=$(printf %s "$1" | cut -f1 -d=)
    value=$(printf %s "$1" | sed "s/=/${safeDelimiter}/" | cut -f2 "-d${safeDelimiter}")

    kiwiSetArgument "$param" "$value"
    shift
  done
}

kiwiDownload() {
  installPath="$1"
  downloadUrlBase="$2"
  format="$3"

  # Detect os/arch
  # Some ref: https://github.com/kiwi-sh/kiwi/blob/e6fa80cb6178ff4e9735265281b5eae811f05f11/${binaryName}#L1920
  nodeOs=
  case $(uname | tr '[:upper:]' '[:lower:]') in
    linux*) nodeOs=linux ;;
    darwin*) nodeOs=darwin ;;
    *) kiwiPrint "Unsupported OS"; exit 1 ;;
  esac

  hostArch="$(command uname -m)"
  nodeArch=
  case "$hostArch" in
    x86_64|amd64) nodeArch=x64 ;;
    aarch64) nodeArch=arm64 ;;
    *) nodeArch="${hostArch}" ;;
  esac

  downloadUrl="$(printf %s "$downloadUrlBase" | sed -e "s/:nodeOs/$nodeOs/" -e "s/:nodeArch/$nodeArch/")"

  if ! command -v curl >/dev/null && ! command -v wget >/dev/null; then
    kiwiPrint "The installer requires at least curl or wget."
    exit 1
  fi

  tmpPath="$(mktemp)"
  
  if command -v curl >/dev/null; then
    kiwiPrint "Downloading using curl from $downloadUrl into $tmpPath"
    curl --compressed -m120 -sSfLo "$tmpPath" "$downloadUrl"
  elif command -v wget >/dev/null; then
    kiwiPrint "Downloading using wget from $downloadUrl into $tmpPath"
    wget --timeout=120 -qO "$tmpPath" "$downloadUrl"
  fi

  kiwiPrint "Installing binary in $installPath"
  case "$format" in
  raw)
    mv "$tmpPath" "$installPath"
    ;;
  gz)
    gzip -cd "$tmpPath" > "$installPath"
    rm "$tmpPath" || { kiwiPrint "Failed to delete the temporary file $tmpPath"; }
    ;;
  *)
    kiwiPrint "Invalid format requested: $format"
    exit 1
  esac

  chmod +x "$installPath"
}

kiwiTryProfile() {
  if [ -z "${1-}" ] || [ ! -f "${1}" ]; then
    return 1
  fi
  printf %s "${1}"
}

# Very much adapted from https://raw.githubusercontent.com/kiwi-sh/kiwi/v0.39.7/install.sh
#
# Detect profile file if not specified as environment variable
# (eg: PROFILE=~/.myprofile)
# The echo'ed path is guaranteed to be an existing file
# Otherwise, an empty string is returned
#
kiwiDetectProfile() {
  if [ "${PROFILE-}" = '/dev/null' ]; then
    # the user has specifically requested NOT to have kiwi touch their profile
    return
  fi

  if [ -n "${PROFILE}" ] && [ -f "${PROFILE}" ]; then
    printf %s "${PROFILE}"
    return
  fi

  detectedProfile=''

  if [ "${SHELL#*bash}" != "$SHELL" ]; then
    if [ -f "$HOME/.bashrc" ]; then
      detectedProfile="$HOME/.bashrc"
    elif [ -f "$HOME/.bash_profile" ]; then
      detectedProfile="$HOME/.bash_profile"
    fi
  elif [ "${SHELL#*zsh}" != "$SHELL" ]; then
    if [ -f "$HOME/.zshrc" ]; then
      detectedProfile="$HOME/.zshrc"
    elif [ -f "$HOME/.zprofile" ]; then
      detectedProfile="$HOME/.zprofile"
    fi
  fi

  if [ -z "$detectedProfile" ]; then
    for eachProfile in ".profile" ".bashrc" ".bash_profile" ".zprofile" ".zshrc"
    do
      if detectedProfile="$(kiwiTryProfile "${HOME}/${eachProfile}")"; then
        break
      fi
    done
  fi

  if [ -n "$detectedProfile" ]; then
    printf %s "$detectedProfile"
  fi
}

kiwiAddBinToPath() {
  binaryName="$1"
  detectedProfile="$(kiwiDetectProfile)"
  kiwiBinDir="$(kiwiBinInstallDir | command sed "s:^$HOME:\$HOME:")"

  sourceStr="\\nexport KIWI_BIN_DIR=\"${kiwiBinDir}\"\\n[ -s \"\$KIWI_BIN_DIR/${binaryName}\" ] && export PATH=\"\$PATH:\$KIWI_BIN_DIR\" # This loads kiwi into the PATH\\n"

  if [ -z "${detectedProfile-}" ] ; then
    if [ -n "${PROFILE}" ]; then
      triedProfile="${detectedProfile} (as defined in \$PROFILE), "
    fi
    kiwiPrint "=> Profile not found. Tried ${triedProfile-}~/.bashrc, ~/.bash_profile, ~/.zprofile, ~/.zshrc, and ~/.profile."
    kiwiPrint "=> Create one of them and run this script again"
    kiwiPrint "   OR"
    kiwiPrint "=> Append the following lines to the correct file yourself:"
    command printf "${sourceStr}"
    kiwiPrint "=> Then, you can give $binaryName a try with: $binaryName version"
    kiwiPrint
  else
    if ! command grep -qc "/${binaryName}" "$detectedProfile"; then
      kiwiPrint "=> Appending kiwi source string to $detectedProfile"
      command printf "${sourceStr}" >> "$detectedProfile"
    else
      kiwiPrint "=> kiwi source string already in $detectedProfile, skipping append"
    fi
    # shellcheck disable=SC1090
    . "$detectedProfile"
  fi

  if kiwiCheckCommand "$binaryName"; then
    kiwiPrint "=> Kiwi binary $binaryName installed in ${kiwiBinDir}/${binaryName}"
    kiwiPrint "=> We have added the binary to your PATH. Please restart your terminal our run: . $detectedProfile"
    kiwiPrint "=> Once you have reloaded your PATH, give it a try with: $binaryName version"
  fi
}