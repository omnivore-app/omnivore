FROM node:18.16
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Installs latest Chromium package.
RUN apt-get update && apt-get install -y \
    chromium \
    firefox-esr \
    ca-certificates \
    nodejs \
    yarn \
    g++ \
    make \
    python3

WORKDIR /app

ENV CHROMIUM_PATH /usr/bin/chromium
ENV FIREFOX_PATH /usr/bin/firefox
ENV LAUNCH_HEADLESS=true

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/content-fetch/package.json ./packages/content-fetch/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json
COPY /packages/puppeteer-parse/package.json ./packages/puppeteer-parse/package.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile

ADD /packages/content-fetch ./packages/content-fetch
ADD /packages/content-handler ./packages/content-handler
ADD /packages/puppeteer-parse ./packages/puppeteer-parse
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

# In Firefox we can't use the adblocking sites. Adding them to the hosts file of the docker seems to work.
RUN wget https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts
RUN echo "#!/bin/bash \n\
cat hosts >> /etc/hosts \n\
yarn workspace @omnivore/content-fetch start" >> ./start.sh

RUN chmod +x ./start.sh

CMD ["./start.sh"]

