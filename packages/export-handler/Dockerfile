FROM node:22.12-alpine

WORKDIR /app

RUN apk add g++ make python3

ENV PORT 8080

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY /packages/export-handler/package.json ./packages/export-handler/package.json

RUN yarn install --pure-lockfile --network-timeout=300000


COPY /packages/export-handler ./packages/export-handler
RUN yarn workspace @omnivore/export-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/export-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production --network-timeout=300000


EXPOSE 8080

ENTRYPOINT ["yarn", "workspace", "@omnivore/export-handler", "start"]
