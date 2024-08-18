# Use an official Node.js runtime as the base image
FROM node:20.16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 1337

# Start the Parse Server
CMD ["npm", "start"]
