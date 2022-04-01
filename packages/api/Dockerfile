FROM node:14.18-alpine as builder

WORKDIR /app

ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/readabilityjs/package.json ./packages/readabilityjs/package.json
COPY /packages/api/package.json ./packages/api/package.json

RUN yarn install --pure-lockfile --production

ADD /packages/readabilityjs ./packages/readabilityjs
ADD /packages/api ./packages/api

RUN yarn
RUN yarn workspace @omnivore/api build



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
COPY --from=builder /app/packages/api/index_settings.json /app/packages/api/index_settings.json

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/api", "start"]
