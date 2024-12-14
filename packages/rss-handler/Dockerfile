FROM node:22.12-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .eslintrc .

COPY /packages/rss-handler/package.json ./packages/rss-handler/package.json

RUN yarn install --pure-lockfile

ADD /packages/rss-handler ./packages/rss-handler
RUN yarn workspace @omnivore/rss-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/rss-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/rss-handler", "start"]

