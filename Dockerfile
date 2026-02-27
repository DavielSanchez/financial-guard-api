FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies optimally
# Copy only package files first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the standard port for Koyeb (usually 8000 or 8080)
EXPOSE 8080

# Define the command to start the app
CMD ["npm", "start"]
