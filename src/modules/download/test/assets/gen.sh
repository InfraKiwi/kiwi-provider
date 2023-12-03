#!/usr/bin/env bash
set -euo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"
cd "$DIR"

rm -rf archive || true

mkdir archive
cd archive
echo -n hello > hello.txt
mkdir another
echo -n anotherMe > another/another.txt

cd "$DIR/archive"
echo "=== tar.gz ==="
rm "$DIR/archive.tar.gz" || true
tar -czvf "$DIR/archive.tar.gz" *

echo "=== zip ==="
rm "$DIR/archive.zip" || true
zip -r "$DIR/archive.zip" *