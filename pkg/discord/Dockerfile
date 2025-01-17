 FROM node:22.12 as builder

WORKDIR /app

RUN apt-get update && apt-get install -y g++ make python3

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/discord/src ./packages/discord/src
COPY /packages/discord/package.json ./packages/discord/package.json
COPY /packages/discord/tsconfig.json ./packages/discord/tsconfig.json

RUN yarn install --pure-lockfile
RUN yarn workspace @omnivore/discord build

FROM node:22.12 as runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/packages/discord/dist /app/packages/discord/dist
COPY --from=builder /app/packages/discord/package.json /app/packages/discord/package.json
COPY --from=builder /app/packages/discord/node_modules /app/packages/discord/node_modules

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

CMD ["yarn", "workspace", "@omnivore/discord", "start"]
