#Node.js base image
FROM node:18-bullseye

#python, pip, venv
RUN apt-get update && \
apt-get install -y python3 python3-pip python3-venv && \
rm -rf /var/lib/apt/lists/*

#working directory for application
WORKDIR /app

#package.json and package-lock.json
COPY package*.json ./
RUN npm install

#copy rest of code
COPY . .

#python virtual environment
RUN python3 -m venv /app/venv

# Copy .env file to the container
COPY backend/backend_details.env /app/backend/backend_details.env

#copy python dependencies
COPY backend/v_e_utils/requirements.txt /app/backend/v_e_utils/requirements_original.txt
RUN /app/venv/bin/pip install -r /app/backend/v_e_utils/requirements_original.txt

#port
EXPOSE 3001 5001

#start app
CMD ["sh", "-c", "npm start & node backend/server.js"]