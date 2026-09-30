FROM node:24.19-alpine AS builder

WORKDIR /app

RUN apk add  \
        python3 \
        make \
        g++

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/discover/src ./packages/discover/src
COPY /packages/discover/package.json ./packages/discover/package.json
COPY /packages/discover/tsconfig.json ./packages/discover/tsconfig.json

RUN yarn install --pure-lockfile --network-timeout=300000

RUN yarn workspace @omnivore/discover build

FROM golang:alpine as go-builder

WORKDIR /app

COPY /packages/discover/proxy /packages/discover/

RUN cd /packages/discover/ && go mod tidy
RUN cd /packages/discover/ && go mod download
RUN cd /packages/discover/ && go install
RUN cd /packages/discover/ && go build -o /goproxy


FROM node:24.19-slim AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=go-builder /goproxy /app/goproxy

COPY --from=builder /app/packages/discover/dist /app/packages/discover/dist
COPY --from=builder /app/packages/discover/package.json /app/packages/discover/package.json
COPY --from=builder /app/packages/discover/node_modules /app/packages/discover/node_modules

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json


CMD ["/bin/bash", "-c", "/app/goproxy &  yarn workspace @omnivore/discover start"]
