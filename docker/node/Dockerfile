# Use official Node image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and lockfile first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend source
COPY . .

# Expose dev server port
EXPOSE 5173

# Default command: run dev server
CMD ["npm", "run", "dev"]
