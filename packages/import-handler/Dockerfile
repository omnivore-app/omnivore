FROM node:14.18-alpine

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apk add g++ make python3

ENV PORT 9090

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/readabilityjs/package.json ./packages/readabilityjs/package.json
COPY /packages/import-handler/package.json ./packages/import-handler/package.json

RUN yarn install --pure-lockfile

ADD /packages/import-handler ./packages/import-handler
ADD /packages/readabilityjs ./packages/readabilityjs
RUN yarn workspace @omnivore/import-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/import-handler/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 9090

ENTRYPOINT ["yarn", "workspace", "@omnivore/import-handler", "start_gcf"]
