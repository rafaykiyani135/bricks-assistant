# Multi-stage Dockerfile for Angular client
# Builder stage: installs dependencies and builds the production bundle
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install dependencies based on package-lock if present, otherwise fallback to npm install
COPY package*.json ./
ENV CI=true
RUN npm ci --silent || npm install --silent

# Copy the rest of the sources and build the app
COPY . .
# Build with production configuration
RUN npm run build -- --configuration production


# Runtime stage: lightweight node running the embedded server
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.output/* .

EXPOSE 3000

CMD ["node", "server/index.mjs"]
