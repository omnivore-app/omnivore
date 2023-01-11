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
  yarn \
  g++ \
  make \
  python3

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
WORKDIR /app

ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV LAUNCH_HEADLESS=true
ENV PORT 9090

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/readabilityjs/package.json ./packages/readabilityjs/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json
COPY /packages/import-handler/package.json ./packages/import-handler/package.json


RUN yarn install --pure-lockfile

ADD /packages/content-handler ./packages/content-handler
ADD /packages/import-handler ./packages/import-handler
ADD /packages/readabilityjs ./packages/readabilityjs
RUN yarn workspace @omnivore/import-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/import-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 9090

# USER pptruser
ENTRYPOINT ["yarn", "workspace", "@omnivore/import-handler", "start_gcf"]
