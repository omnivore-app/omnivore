FROM node:22.12

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY /packages/db/package.json ./packages/db/package.json

RUN apt-get update && apt-get install -y \
  postgresql \
  uuid-runtime

RUN yarn install

# Install bcryptjs globally for password hashing
RUN npm install -g bcryptjs

ADD /packages/db ./packages/db
ADD /packages/db/setup.sh ./packages/db/setup.sh

# Copy the hash-password script
COPY packages/api/scripts/hash-password.js /usr/local/bin/hash-password.js
RUN chmod +x /usr/local/bin/hash-password.js

# Copy users.csv if it exists (optional file)
COPY packages/db/users.csv* /app/packages/db/ 2>/dev/null || true

CMD ["yarn", "workspace", "@omnivore/db", "migrate"]
