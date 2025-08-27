FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY app/package.json ./
COPY app/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy all app source code
COPY app/ ./
# Expose port
EXPOSE 3000

# Start the development server
CMD ["pnpm", "dev"]
