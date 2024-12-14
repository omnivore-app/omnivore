 FROM node:22.12 as builder

WORKDIR /app

RUN apt-get update && apt-get install -y g++ make python3

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/discover/src ./packages/discover/src
COPY /packages/discover/package.json ./packages/discover/package.json
COPY /packages/discover/tsconfig.json ./packages/discover/tsconfig.json

RUN yarn install --pure-lockfile
RUN yarn workspace @omnivore/discover build

FROM node:22.12 as runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/packages/discover/dist /app/packages/discover/dist
COPY --from=builder /app/packages/discover/package.json /app/packages/discover/package.json
COPY --from=builder /app/packages/discover/node_modules /app/packages/discover/node_modules

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

CMD ["yarn", "workspace", "@omnivore/discover", "start"]
