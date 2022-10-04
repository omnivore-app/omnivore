FROM node:14.18-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/content-handler/package.json ./packages/content-handler/package.json

RUN yarn install --pure-lockfile

ADD /packages/inbound-email-handler ./packages/inbound-email-handler
ADD /packages/content-handler ./packages/content-handler
RUN yarn workspace @omnivore/content-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/inbound-email-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/inbound-email-handler", "start"]

