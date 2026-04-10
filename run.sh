#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="coding-problem-workspace"
COMMAND="${1:-judge}"
PROBLEM_ID="${2:-codeforces-4a}"
CASE_KIND="${3:-sample}"

docker build -t "${IMAGE_NAME}" .

case "${COMMAND}" in
  list)
    docker run --rm "${IMAGE_NAME}" list
    ;;
  solve)
    docker run --rm -i "${IMAGE_NAME}" solve "${PROBLEM_ID}"
    ;;
  judge)
    docker run --rm "${IMAGE_NAME}" judge "${PROBLEM_ID}" "${CASE_KIND}"
    ;;
  generate)
    docker run --rm "${IMAGE_NAME}" generate "${PROBLEM_ID}"
    ;;
  *)
    echo "Usage: ./run.sh [list|solve|judge|generate] [problem-id] [sample|hidden]" >&2
    exit 1
    ;;
esac
