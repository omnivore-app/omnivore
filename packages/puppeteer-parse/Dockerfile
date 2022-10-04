# FROM node:14-slim

# # Taken from pu

# # Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# # Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# # installs, work.
# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
#       --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# ENV CHROMIUM_PATH "/usr/bin/google-chrome-stable"

# ------------------------

# FROM --platform=linux/arm64 node:14.18

# RUN apt-get update \
#   && apt-get install -y chromium \
#   && apt-get install -y ca-certificates \
#   fonts-liberation \
#   libappindicator3-1 \
#   libasound2 \
#   libatk-bridge2.0-0 \
#   libatk1.0-0 \
#   libc6 \
#   libcairo2 \
#   libcups2 \
#   libdbus-1-3 \
#   libexpat1 \
#   libfontconfig1 \
#   libgbm1 \
#   libgcc1 \
#   libglib2.0-0 \
#   libgtk-3-0 \
#   libnspr4 \
#   libnss3 \
#   libpango-1.0-0 \
#   libpangocairo-1.0-0 \
#   libstdc++6 \
#   libx11-6 \
#   libx11-xcb1 \
#   libxcb1 \
#   libxcomposite1 \
#   libxcursor1 \
#   libxdamage1 \
#   libxext6 \
#   libxfixes3 \
#   libxi6 \
#   libxrandr2 \
#   libxrender1 \
#   libxss1 \
#   libxtst6 \
#   lsb-release \
#   wget \
#   xdg-utils

FROM node:14.18-alpine

# Installs latest Chromium (92) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
WORKDIR /app

ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV LAUNCH_HEADLESS=true

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/puppeteer-parse/package.json ./packages/puppeteer-parse/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json

RUN yarn install --pure-lockfile

ADD /packages/puppeteer-parse ./packages/puppeteer-parse
ADD /packages/content-handler ./packages/content-handler
RUN yarn workspace @omnivore/content-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/puppeteer-parse/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 9090

# USER pptruser
ENTRYPOINT ["yarn", "workspace", "@omnivore/puppeteer-parse", "start"]
