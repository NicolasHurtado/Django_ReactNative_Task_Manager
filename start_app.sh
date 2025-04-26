#!/bin/bash

# go to the backend folder and execute docker-compose
echo "Starting backend..."
cd backend
docker compose up -d

# go to the frontend folder and run it
echo "Starting frontend..."
cd ../task_manager
npm install
npx expo start --clear

echo "Application started successfully!" 