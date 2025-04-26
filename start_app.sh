#!/bin/bash

# go to the backend folder and execute docker-compose
echo "Starting backend..."
cd backend
docker compose up --build -d

# go to the frontend folder and run it
echo "Starting frontend..."
cd ../task_manager
echo "Installing dependencies (this may take a moment)..."
npm install --loglevel=error
echo "Dependencies installed successfully."
npx expo start --clear

echo "Application started successfully!" 