FROM node:14.18-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .eslintrc .

COPY /packages/queue-manager/package.json ./packages/queue-manager/package.json

RUN yarn install --pure-lockfile

ADD /packages/queue-manager ./packages/queue-manager
RUN yarn workspace @omnivore/queue-manager build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/queue-manager/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/queue-manager", "start"]

