FROM node:14.18-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

COPY /packages/text-to-speech/package.json ./packages/text-to-speech/package.json

RUN yarn install --pure-lockfile

ADD /packages/text-to-speech ./packages/text-to-speech
RUN yarn workspace @omnivore/text-to-speech-handler build

# After building, fetch the production dependencies
RUN rm -rf /app/packages/text-to-speech/node_modules
RUN rm -rf /app/node_modules
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/text-to-speech-handler", "start_streaming"]

