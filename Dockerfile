FROM node:20-alpine

# Enable corepack for pnpm support (reads packageManager from package.json)
RUN corepack enable

WORKDIR /app

# Copy package manifests for install layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies inside container
RUN pnpm install

# Source code is mounted via volume at runtime (hot reload)
EXPOSE 3000

CMD ["pnpm", "dev"]
