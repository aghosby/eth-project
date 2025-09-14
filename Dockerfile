FROM node:16-alpine3.16 as build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Clean npm cache and install Angular CLI globally
RUN npm cache clean --force
RUN npm install -g @angular/cli@16.1.0

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app
RUN ng build --configuration production

# Production stage
FROM nginx:1.23.0-alpine

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app  
COPY --from=build /app/dist/eth /usr/share/nginx/html

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
