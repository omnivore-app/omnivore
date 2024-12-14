FROM node:22.12-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .eslintrc .

COPY /packages/thumbnail-handler/package.json ./packages/thumbnail-handler/package.json

RUN yarn install --pure-lockfile

ADD /packages/thumbnail-handler ./packages/thumbnail-handler
RUN yarn workspace @omnivore/thumbnail-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/thumbnail-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/thumbnail-handler", "start"]

