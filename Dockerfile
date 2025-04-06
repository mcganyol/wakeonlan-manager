# Use official Node.js LTS image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# (Copy package.json + package-lock.json first for better Docker cache)
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Create a folder for SQLite data if needed
RUN mkdir -p ./data

# Expose the app port (choose 3000 for example)
EXPOSE 3000

# Start the app
CMD [ "node", "server.js" ]
