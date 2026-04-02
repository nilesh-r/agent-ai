FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the application (optional for dev, but good for structure)
# RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
# We use dev mode here for easier iteration if needed, otherwise 'npm start'
CMD ["npm", "run", "dev"]
