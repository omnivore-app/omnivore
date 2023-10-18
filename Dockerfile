FROM node:18.16-alpine as builder

ARG APP_ENV=prod
ARG BASE_URL=http://omnivore-web.unicorn-tailor.ts.net
ARG SERVER_BASE_URL=http://omnivore-web.unicorn-tailor.ts.net:4000
ARG HIGHLIGHTS_BASE_URL=http://omnivore-web.unicorn-tailor.ts.net
ENV NEXT_PUBLIC_APP_ENV=$APP_ENV
ENV NEXT_PUBLIC_BASE_URL=$BASE_URL
ENV NEXT_PUBLIC_SERVER_BASE_URL=$SERVER_BASE_URL
ENV NEXT_PUBLIC_HIGHLIGHTS_BASE_URL=$HIGHLIGHTS_BASE_URL

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apk add g++ make python3

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY selfhost.sh /app/selfhost.sh
COPY /packages/readabilityjs/package.json ./packages/readabilityjs/package.json
COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/text-to-speech/package.json ./packages/text-to-speech/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json
COPY /packages/db/package.json ./packages/db/package.json
COPY /packages/web/package.json ./packages/web/package.json

RUN yarn install --pure-lockfile

ADD /packages/readabilityjs ./packages/readabilityjs
ADD /packages/api ./packages/api
ADD /packages/text-to-speech ./packages/text-to-speech
ADD /packages/content-handler ./packages/content-handler
ADD /packages/db ./packages/db
COPY /packages/web ./packages/web

RUN yarn workspace @omnivore/text-to-speech-handler build
RUN yarn workspace @omnivore/content-handler build
RUN yarn workspace @omnivore/api build
# RUN echo "module.exports = {}" > ./packages/web/next.config.js
RUN yarn workspace @omnivore/web build

RUN rm -rf /app/packages/api/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

FROM node:18.16-alpine as runner

WORKDIR /app

ENV NODE_ENV production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=8080

COPY --from=builder /app/packages/api/dist /app/packages/api/dist
COPY --from=builder /app/packages/readabilityjs/ /app/packages/readabilityjs/
COPY --from=builder /app/packages/api/package.json /app/packages/api/package.json
COPY --from=builder /app/packages/api/node_modules /app/packages/api/node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/packages/text-to-speech/ /app/packages/text-to-speech/
COPY --from=builder /app/packages/content-handler/ /app/packages/content-handler/
COPY --from=builder /app/packages/db/ /app/packages/db/
COPY --from=builder /app/packages/web/ /app/packages/web/
COPY --from=builder /app/selfhost.sh /app/selfhost.sh

RUN apk add postgresql-client
RUN chmod 0755 /app/selfhost.sh

EXPOSE 8080

# Using a custom script to customize imageproxy startup and to pass
# signatureKey through env variable
ENTRYPOINT ["/app/selfhost.sh"]
