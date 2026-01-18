# Multi-stage Dockerfile for NestJS server
# Builder stage: install all dependencies and build the app
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev) for the build
COPY package*.json ./
ENV CI=true
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build


# Runtime stage: smaller image with only production dependencies and built artifacts
FROM node:${NODE_VERSION}-alpine AS runtime

WORKDIR /app

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --production --silent

# Copy built artifacts from the builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start the compiled app
CMD ["node", "dist/main"]
