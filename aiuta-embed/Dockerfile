# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM us-central1-docker.pkg.dev/aiuta-dev/ci-public/node:20.18-alpine@sha256:e7537b96ceb13e63b8e8951118afdd6f5a1bbb8dd56fd81092132d7a8475fec8 AS runner
WORKDIR /app
# Expose the port the app will run on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV production

# Copy necessary files from the build stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/web_sdk.js ./web_sdk.js


# Start the application using the entry point script
CMD ["node", "/app/web_sdk.js"]
