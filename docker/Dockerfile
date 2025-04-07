# Use official Node.js LTS image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Install ping utility
RUN apt-get update && apt-get install -y iputils-ping

# Expose the app port (choose 3000 for example)
EXPOSE 3000
EXPOSE 35729

ENTRYPOINT [ "/app/docker/startup.sh" ]

# Start the app
CMD ["npm", "run", "dev"]