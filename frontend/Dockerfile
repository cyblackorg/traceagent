FROM node:18-alpine

WORKDIR /app

# Set node options to increase memory limit
ENV NODE_OPTIONS=--max_old_space_size=2048

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "start"] 