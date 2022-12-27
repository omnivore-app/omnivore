FROM node:14.18-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintrc .

ADD /packages/readabilityjs ./packages/readabilityjs
RUN yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/readability", "start"]

