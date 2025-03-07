
# Base image for build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy build artifacts from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# Install a simple server to serve static files
RUN npm install -g serve

# Expose port 8080
EXPOSE 8080

# Start serving the application
CMD ["serve", "-s", "dist", "-l", "8080"]
