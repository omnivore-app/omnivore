FROM node:14.18-alpine as builder

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apk add g++ make python3

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/readabilityjs/package.json ./packages/readabilityjs/package.json
COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/text-to-speech/package.json ./packages/text-to-speech/package.json

RUN yarn install --pure-lockfile

ADD /packages/readabilityjs ./packages/readabilityjs
ADD /packages/api ./packages/api
ADD /packages/text-to-speech ./packages/text-to-speech

RUN yarn
RUN yarn workspace @omnivore/api build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/api/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

FROM node:14.18-alpine as runner

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
EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/api", "start"]
