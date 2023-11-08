FROM node:18.16-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .eslintrc .

COPY /packages/following-handler/package.json ./packages/following-handler/package.json

RUN yarn install --pure-lockfile

COPY /packages/following-handler ./packages/following-handler
RUN yarn workspace @omnivore/rss-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/following-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/following-handler", "start"]

