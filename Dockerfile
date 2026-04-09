FROM gradle:8.8-jdk21 AS build
WORKDIR /app

COPY . .
RUN gradle --no-daemon installDist

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/build/install/CodingProblemWorkspace /app/CodingProblemWorkspace

ENTRYPOINT ["/app/CodingProblemWorkspace/bin/CodingProblemWorkspace"]
