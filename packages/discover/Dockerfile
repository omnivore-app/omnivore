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

COPY /packages/proxy /packages/proxy

RUN cd /packages/proxy/ && go mod tidy
RUN cd /packages/proxy/ && go mod download
RUN cd /packages/proxy/ && go install
RUN cd /packages/proxy/ && go build -o /goproxy


FROM node:24.19-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=go-builder /goproxy /app/goproxy

RUN apk add ca-certificates bash \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

COPY --from=builder /app/packages/discover/dist /app/packages/discover/dist
COPY --from=builder /app/packages/discover/package.json /app/packages/discover/package.json
COPY --from=builder /app/packages/discover/node_modules /app/packages/discover/node_modules

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json


CMD ["/bin/bash", "-c", "/app/goproxy & yarn workspace @omnivore/discover start"]
