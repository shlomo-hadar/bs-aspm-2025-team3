# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies using clean install (npm ci) for consistency
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite application (outputs to /app/dist)
# RUN npm run build
RUN npm install

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]