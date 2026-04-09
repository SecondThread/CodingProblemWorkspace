#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="coding-problem-workspace"

docker build -t "${IMAGE_NAME}" .
docker run --rm "${IMAGE_NAME}"
