# Use official Node.js LTS image
FROM node:20-slim

# Create app directory
WORKDIR /app

RUN npm install
RUN npm install -g nodemon

# Expose the app port (choose 3000 for example)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]