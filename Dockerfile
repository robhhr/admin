# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:24-alpine

# Create and change to the app directory.
WORKDIR /app

# Copy the package manifests to the container image
COPY package.json pnpm-lock.yaml ./

# Install packages
RUN corepack enable && pnpm install --frozen-lockfile

# Copy local code to the container image.
COPY . ./

# Build the app.
RUN pnpm run build

# Serve the app
CMD ["pnpm", "run", "start"]
