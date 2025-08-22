# Multi-stage build for React + Node.js app
FROM node:18-alpine AS client-build

# Build React client
WORKDIR /app/client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy client source code
COPY client/ ./

# Accept build-time environment variables for React
ARG REACT_APP_OKTA_ISSUER
ARG REACT_APP_OKTA_CLIENT_ID
ARG REACT_APP_API_URL

# Set environment variables for React build
ENV REACT_APP_OKTA_ISSUER=$REACT_APP_OKTA_ISSUER
ENV REACT_APP_OKTA_CLIENT_ID=$REACT_APP_OKTA_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React app
RUN npm run build

# Production server
FROM node:18-alpine AS production

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy server package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy server code
COPY server.js ./

# Copy built React app
COPY --from=client-build /app/client/build ./client/build

# Change ownership of the app directory to the nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "server"]
