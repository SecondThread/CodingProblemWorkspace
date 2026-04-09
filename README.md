# CodingProblemWorkspace

Kotlin workspace with Docker support.

## Run locally (with Gradle)

```bash
gradle run
```

## Run with Docker

```bash
./run.sh
```

This script runs:

```bash
docker build -t coding-problem-workspace .
docker run --rm coding-problem-workspace
```
