# Build stage  
FROM node:22-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-pip

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./
COPY tsconfig.base.json ./

# Copy package files for dependency resolution
COPY packages/api-nest/package.json ./packages/api-nest/
COPY packages/db/package.json ./packages/db/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/api-nest ./packages/api-nest
COPY packages/db ./packages/db

# Build the application
WORKDIR /app/packages/api-nest
RUN yarn build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/api-nest/package.json ./packages/api-nest/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/packages/api-nest/dist ./packages/api-nest/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 4001

CMD ["node", "packages/api-nest/dist/main"]
