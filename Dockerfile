FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY src ./src
COPY test ./test
COPY problems ./problems

RUN npm run build
RUN npm test

FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/problems ./problems

ENTRYPOINT ["node", "dist/src/cli.js"]
CMD ["judge", "codeforces-4a", "sample"]
