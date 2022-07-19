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

COPY . /app/
WORKDIR app

RUN yarn install --pure-lockfile

EXPOSE 8080

ENTRYPOINT ["yarn", "start"]

