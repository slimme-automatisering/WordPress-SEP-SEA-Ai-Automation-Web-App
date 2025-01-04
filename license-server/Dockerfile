FROM node:18-alpine

WORKDIR /usr/src/app

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create volume mount points
RUN mkdir -p /var/lib/license

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the server
CMD ["npm", "start"]
