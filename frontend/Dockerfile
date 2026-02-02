# Frontend Dockerfile - Next.js React Application
# Multi-stage build for optimization

FROM node:20-alpine as builder

# Install dependencies
WORKDIR /app
COPY frontend/package*.json ./

# Install ALL dependencies (including dev) for build
RUN npm install

# Copy source code
COPY frontend/ .

# Build Next.js application
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package files for runtime
COPY --from=builder /app/package*.json ./

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=1024"

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Run Next.js server
CMD ["node", "server.js"]
