# Dockerfile for backend (optional, Railway can deploy without it)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server/ .

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]