FROM node:24.19-alpine AS builder-api

WORKDIR /app

ENV CHROMIUM_PATH=/usr/bin/chromium
ENV FIREFOX_PATH=/usr/bin/firefox
ENV LAUNCH_HEADLESS=true

RUN apk -U upgrade
RUN apk add g++ make python3
RUN rm -rf /var/cache/apk/*

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./
COPY /packages/content/content-fetch/package.json ./packages/content/content-fetch/package.json
COPY /packages/content/content-handler/package.json ./packages/content/content-handler/package.json
COPY /packages/content/puppeteer-parse/package.json ./packages/content/puppeteer-parse/package.json
COPY /packages/utils/package.json ./packages/utils/package.json
COPY packages/content/readabilityjs ./packages/content/readabilityjs
COPY packages/content/text-to-speech ./packages/content/text-to-speech
COPY packages/content/liqe ./packages/content/liqe
COPY packages/discover ./packages/discover
COPY packages/db ./packages/db
COPY /packages/web/package.json ./packages/web/package.json

COPY packages/utils ./packages/utils
COPY packages/api ./packages/api
COPY packages/web   ./packages/web
COPY ./packages/web/next.config.self.js ./packages/web/next.config.js
COPY packages/discover ./packages/discover
COPY /packages/content/content-fetch ./packages/content/content-fetch
COPY /packages/content/content-handler ./packages/content/content-handler
COPY /packages/content/puppeteer-parse ./packages/content/puppeteer-parse

RUN yarn install --pure-lockfile --network-timeout=300000 && \
    yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/text-to-speech-handler build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/puppeteer-parse build && \
    yarn workspace @omnivore/content-fetch build && \
    yarn workspace @omnivore/liqe build && \
    yarn workspace @omnivore/api build && \
    yarn workspace @omnivore/discover build && \
    yarn workspace @omnivore/db build && \
    cp -r ./packages/db/migrations ./packages/db/build && \
    yarn workspace @omnivore/web build && \
    rm -rf /app/packages/api/node_modules /app/node_modules /app/packages/content-fetch/node_modules && \
    yarn install --pure-lockfile --production --network-timeout=300000

FROM golang:alpine as go-builder

WORKDIR /app

COPY /packages/content/proxy /packages/content/proxy

RUN cd /packages/content/proxy/ && go mod tidy
RUN cd /packages/content/proxy/ && go mod download
RUN cd /packages/content/proxy/ && go install
RUN cd /packages/content/proxy/ && go build -o /goproxy

FROM node:24.19-alpine AS runner
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk update && apk add netcat-openbsd && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=go-builder /goproxy /app/goproxy

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=8080
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV FIREFOX_PATH=/usr/bin/firefox
ENV LAUNCH_HEADLESS=true
ENV START_SINGLE=true

RUN echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
&& echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
&& echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories  \
&& apk -U upgrade \
&& apk add --no-cache \
    firefox@edge \
    freetype@edge \
    ttf-freefont@edge \
    nss@edge \
    libstdc++@edge \
    bash \
    sqlite-libs@edge \
    chromium@edge \
    firefox-esr@edge \
    ca-certificates@edge \
    bash \
    postgresql18 \
    postgresql18-contrib \
    su-exec \
    git \
    make \
    gcc \
    musl-dev \
    clang@edge \
    llvm \
    uuidgen \
    postgresql18-dev@edge \
    mandoc man-pages \
&& mkdir -p /var/lib/postgresql/data /run/postgresql \
&& chown -R postgres:postgres /var/lib/postgresql /run/postgresql \
&& rm -rf /var/lib/apt/lists/* \
&& update-ca-certificates \
&& git clone --depth 1 --branch v0.8.7 https://github.com/pgvector/pgvector.git /tmp/pgvector \
&& make OPTFLAGS="" -C /tmp/pgvector \
&& make OPTFLAGS="" -C /tmp/pgvector install \
&& rm -rf /tmp/pgvector

RUN rm -rf /var/cache/apk/*

COPY --from=builder-api /app/packages /app/packages
COPY --from=builder-api /app/node_modules /app/node_modules
COPY --from=builder-api /app/package.json /app/package.json

COPY --from=builder-api /app/packages/api/dist /app/packages/api/dist
COPY --from=builder-api /app/packages/discover/dist /app/packages/api/dist/discover
COPY --from=builder-api /app/packages/content/content-fetch/build /app/packages/api/dist/content-fetch

COPY --from=builder-api /app/packages/web /app/packages/web

EXPOSE 8080
EXPOSE 8090

COPY ./packages/web/env.sh /app/packages/web/env.sh
RUN chmod +x /app/packages/web/env.sh

COPY self-hosting/docker/entry.sh ./entry.sh
RUN chmod +x ./entry.sh

ENTRYPOINT ["./entry.sh"]
