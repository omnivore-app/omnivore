 FROM node:22.12 as builder

WORKDIR /app

RUN apt-get update && apt-get install -y g++ make python3

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/imap-mail-watcher/src ./packages/imap-mail-watcher/src
COPY /packages/imap-mail-watcher/package.json ./packages/imap-mail-watcher/package.json
COPY /packages/imap-mail-watcher/tsconfig.json ./packages/imap-mail-watcher/tsconfig.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile

ADD /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build
RUN yarn workspace @omnivore/imap-mail-watcher build

FROM node:22.12 as runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/packages/imap-mail-watcher/dist /app/packages/imap-mail-watcher/dist
COPY --from=builder /app/packages/imap-mail-watcher/package.json /app/packages/imap-mail-watcher/package.json
COPY --from=builder /app/packages/imap-mail-watcher/node_modules /app/packages/imap-mail-watcher/node_modules
COPY --from=builder /app/packages/utils/ /app/packages/utils/


COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

CMD ["yarn", "workspace", "@omnivore/imap-mail-watcher", "start"]
