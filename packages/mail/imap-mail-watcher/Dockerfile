FROM node:24.22.1-alpine AS builder

WORKDIR /app

RUN apk add --no-cache
RUN echo @edge https://dl-cdn.alpinelinux.org/alpine/v3.17/community >> /etc/apk/repositories \
   && echo @edge https://dl-cdn.alpinelinux.org/alpine/v3.17/main >> /etc/apk/repositories \
   && echo @edge https://dl-cdn.alpinelinux.org/alpine/v3.17/testing >> /etc/apk/repositories  \
 && apk add --no-cache \
    python3@edge~3.10 g++ make


COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/mail/imap-mail-watcher/src ./packages/mail/imap-mail-watcher/src
COPY /packages/mail/imap-mail-watcher/package.json ./packages/mail/imap-mail-watcher/package.json
COPY /packages/mail/imap-mail-watcher/tsconfig.json ./packages/mail/imap-mail-watcher/tsconfig.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile --network-timeout=300000


ADD /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build
RUN yarn workspace @omnivore/imap-mail-watcher build

FROM node:24.22.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/packages/mail/imap-mail-watcher/dist /app/packages/mail/imap-mail-watcher/dist
COPY --from=builder /app/packages/mail/imap-mail-watcher/package.json /app/packages/mail/imap-mail-watcher/package.json
COPY --from=builder /app/packages/mail/imap-mail-watcher/node_modules /app/packages/mail/imap-mail-watcher/node_modules
COPY --from=builder /app/packages/utils/ /app/packages/utils/


COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

CMD ["yarn", "workspace", "@omnivore/imap-mail-watcher", "start"]
