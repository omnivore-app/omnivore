FROM node:22.12-alpine AS build
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Installs latest Chromium package and other dependencies.
RUN apk -U upgrade \
&& apk add --no-cache \
    g++ \
    make \
    python3 \
    py3-pip && \
    rm -rf /var/cache/apk/* 

WORKDIR /app

ENV CHROMIUM_PATH=/usr/bin/chromium
ENV FIREFOX_PATH=/usr/bin/firefox
ENV LAUNCH_HEADLESS=true

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./
COPY /packages/content-fetch/package.json ./packages/content-fetch/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json
COPY /packages/puppeteer-parse/package.json ./packages/puppeteer-parse/package.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile

COPY /packages/content-fetch ./packages/content-fetch
COPY /packages/content-handler ./packages/content-handler
COPY /packages/puppeteer-parse ./packages/puppeteer-parse
COPY /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/puppeteer-parse build && \
    yarn workspace @omnivore/content-fetch build && \
    rm -rf /app/packages/content-fetch/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production

# Running stage
FROM node:22.12-alpine

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
    sqlite-libs@edge \
    chromium@edge \
    firefox-esr@edge \
    ca-certificates@edge \
    rm -rf /var/cache/apk/*

WORKDIR /app

ENV CHROMIUM_PATH=/usr/bin/chromium
ENV FIREFOX_PATH=/usr/bin/firefox
ENV LAUNCH_HEADLESS=true

COPY --from=build /app /app

EXPOSE 8080

# In Firefox we can't use the adblocking sites. Adding them to the hosts file of the docker seems to work.
COPY /packages/content-fetch/start.sh .
RUN wget https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts && \
    chmod +x start.sh

CMD ["./start.sh"]