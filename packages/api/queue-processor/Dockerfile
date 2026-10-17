FROM node:24.19-alpine AS builder

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apk add g++ make python3

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/content/readabilityjs/package.json ./packages/content/readabilityjs/package.json
COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/contenttext-to-speech/package.json ./packages/content/text-to-speech/package.json
COPY /packages/content/content-handler/package.json ./packages/content/content-handler/package.json
COPY /packages/content/liqe/package.json ./packages/liqe/package.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile --network-timeout=300000

ADD /packages/content/readabilityjs ./packages/content/readabilityjs
ADD /packages/api ./packages/api
ADD /packages/content/text-to-speech ./packages/content/text-to-speech
ADD /packages/content/content-handler ./packages/content/content-handler
ADD /packages/content/liqe ./packages/content/liqe
ADD /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build
RUN yarn workspace @omnivore/text-to-speech-handler build
RUN yarn workspace @omnivore/content-handler build
RUN yarn workspace @omnivore/liqe build
RUN yarn workspace @omnivore/api build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/api/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production --network-timeout=300000

FROM node:24.19-alpine AS runnner
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk add netcat-openbsd

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/packages/api/dist /app/packages/api/dist
COPY --from=builder /app/packages/content/readabilityjs/ /app/packages/content/readabilityjs/
COPY --from=builder /app/packages/api/package.json /app/packages/api/package.json
COPY --from=builder /app/packages/api/node_modules /app/packages/api/node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/packages/content/text-to-speech/ /app/packages/content/text-to-speech/
COPY --from=builder /app/packages/content/content-handler/ /app/packages/content/content-handler/
COPY --from=builder /app/packages/content/liqe/ /app/packages/content/liqe/
COPY --from=builder /app/packages/utils/ /app/packages/utils/

CMD ["yarn", "workspace", "@omnivore/api", "start_queue_processor"]
