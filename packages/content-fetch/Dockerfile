FROM node:18.16
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Installs latest Chromium package.
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    nodejs \
    yarn \
    g++ \
    make \
    python3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libu2f-udev \
    libvulkan1 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2

WORKDIR /app

ENV CHROMIUM_PATH /usr/bin/chromium
ENV LAUNCH_HEADLESS=true

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/content-fetch/package.json ./packages/content-fetch/package.json
COPY /packages/readabilityjs/package.json ./packages/readabilityjs/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json
COPY /packages/puppeteer-parse/package.json ./packages/puppeteer-parse/package.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile

ADD /packages/content-fetch ./packages/content-fetch
ADD /packages/content-handler ./packages/content-handler
ADD /packages/puppeteer-parse ./packages/puppeteer-parse
ADD /packages/readabilityjs ./packages/readabilityjs
ADD /packages/utils ./packages/utils
RUN yarn workspace @omnivore/utils build
RUN yarn workspace @omnivore/content-handler build
RUN yarn workspace @omnivore/puppeteer-parse build
RUN yarn workspace @omnivore/content-fetch build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/content-fetch/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/content-fetch", "start"]

