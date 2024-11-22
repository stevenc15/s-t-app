Docker Setup for Soccer Tracker App

Requirements for setup: 
-install Docker
-install Docker compose

Project Structure:
Three main components
 -Node.js: The application server that handles the frontend and backend API.
 -Python: For handling specific backend operations that require Python.
 -MySQL: The database for storing application data.

Dockerfile Breakdown:
1. Base Image
    FROM node:18-bullseye
2. Install Python and Dependencies
    RUN apt-get update && \
        apt-get install -y python3 python3-pip python3-venv && \
        rm -rf /var/lib/apt/lists/*
3. Working Directory and NPM Setup
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
4. Copy Application Code
    COPY . .
5. Python Virtual Environment
    RUN python3 -m venv /app/venv
6. Copy Backend Configuration
    COPY backend/backend_details.env /app/backend/backend_details.env
    COPY backend/v_e_utils/requirements.txt /app/backend/v_e_utils/requirements_original.txt
    RUN /app/venv/bin/pip install -r /app/backend/v_e_utils/requirements_original.txt
7. Expose Ports
    EXPOSE 3001 5001
8. Start the Application
    CMD ["sh", "-c", "npm start & node backend/server.js"]

Docker Compose:
This file configures the proper setup for creating separate containers for frontend, backend and database components, having them run in unison.

    Breakdown: 
    Application Server (soccer tracker app) - 
      
      build application
        build: .
      
      declare port connections for frontend and backend
        ports:
        - "3001:3001"
        - "5001:5001"

      Override environment variables
        environment:
          NODE_ENV: production
          DB_HOST: mysql
          DB_USER: dock-user
          DB_PASSWORD: dockPassword17
          DB_NAME: d_c_app_db
    
      Wait for database to start:
        depends_on:
          mysql:
            condition: service_healthy

    Database (mysql) - 
      
      declare image for sql version
        image: mysql:latest
      
      declare port connections for database
        ports:
          - "3307:3306"

      Override environment variables
        environment:
          MYSQL_ROOT_PASSWORD: kikoCama15*
          MYSQL_USER: dock-user
          MYSQL_PASSWORD: dockPassword17  
          MYSQL_DATABASE: d_c_app_db
    
      Grab database details to create tables
        volumes:
          - ./db_init:/docker-entrypoint-initdb.d
      
      Provide status for database creation/activation:
        healthcheck:
            test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
            interval: 10s
            timeout: 5s
            retries: 3

Commands: 

    Build Docker Images: 
        docker-compose build

    Start Containers:
        docker-compose up

    Stop Containers:
        docker-compose down

Frontend available at http://localhost:3001
Backend available at http://localhost:5001