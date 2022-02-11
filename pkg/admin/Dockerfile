FROM node:14.18-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .
RUN NODE_ENV=production yarn build

ENV PORT=8080
EXPOSE 8080

ENV NODE_ENV production

CMD yarn start
