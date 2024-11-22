# s-t-app
A machine-learning based tracking application that will track all 22 players from a real-life soccer game, while also tracking the referees for visual differentiating purposes. The tracker performs best in tracking each team individually, putting identifiers specific to a players team and using said identifiers to calculate team possession.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development Process](#development-process)
- [Challenges and Learnings](#challenges-and-learnings)

## Features
- User creation and account initialization for application permissions
- Accepts videos in MP4 format, performing best with 30 second snippets for specific play-by-play analysis
- Processess input video and returns video with annotations for visual tracking
- Processed videos include ellipses under players, color-coded by team, for player highlighting and a triangle indicator for player that currently has the ball
- Videos also include statistics  for camera movement in the x and y axis
- Tracker provides analysis for team possession
- Videos are able to be saved to a database and downloaded
- Preview windows are provided for both input and output

## Technologies Used
- Frontend: React, React-Router-Dom, @mui/material, React-Dropzone
- Backend: Express, Node.js, jsonwebtoken (for user authentication and session management), bycrypt (for password hashing and security)
- Machine Learning: Python(YOLOV5 via Ultralytics, OpenCv, NumPy, scikit-learn, pickle, Supervision)
- Database: MySql
- Cloud and Storage: Google Cloud Console

## Replicating the project
Go over to the docker.README.md for replication instructions via docker

## Usage
- Open app on landing page, login or register
- On home page, enter input video (single video), hit 'start processing' button, input preview video is up
- Tracking model will annotate player positions and follow each of the 22 players and also 3 referees frame per frame
- Possession is tracked per team that has the ball
- Once video is processed, preview for output is produced, save or download options available for video
- In output preview windown, observe metrics such as possession and player position, take note of camera movement statistics
- Check for cloud storage activity alert at top left corner
- Saved videos page available is cloud storage is enabled, check your saved videos
  
## Project Structure
s-t-app/       
├── Dockerfile
├── README.md
├── backend
│   ├── ML
│   ├── Routes
│   ├── Routes_help
│   ├── Schemas
│   ├── __tests__
│   ├── backend_details.env
│   ├── cloud_database
│   ├── database
│   ├── docker_details.env
│   ├── inputs
│   ├── server.js
│   └── v_e_utils
├── db_init
│   └── init.sql
├── docker-compose.yaml
├── docker.README.md
├── frontEnd.env
├── inputs
├── node_modules
├── package-lock.json
├── package.json
├── project_structure.txt
├── public
├── src
│   ├── App.css
│   ├── App.js
│   ├── Apptest.js
│   ├── components
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── pages
│   ├── reportWebVitals.js
│   └── setupTests.js
└── yolov8s.pt

## Development Process
- **Backend**: Set up backend server using express, create user and video-related endpoints, initialize cloud storage and database creation leveraging Google Cloud Console and MySql,
  Unit tests created for each endpoint. User authentication and server session management enabled through jsonwebtokens.
- **Frontend**: Utilizing React, pages were organized and developed with components utilized in each page and created using React-Dropzone and React-Router-Dom
- **Model Integration**: Leveraged YOLOV5 to create a trained model to identify players belonging to team 1 and team 2, creating annotations that track possession and camera movements statistics
- **Replication**: Docker setup created for simple reproducibility

## Development Timeline 
- August 21st to October 5th: Model Development. Machine-Learning based tracking model implemented and used within a virtual environment. YOLOv5 model used to get basic tracking of persons on video, with functions created to modify notations of bounding boxes, and annotate team-player and identity ball possession.
- October 5th to October 7th: React app initialized, overall app design and features designed.
- October 7th to October 12th: Backend server created, user and video related endpoints created.
- October 12th to October 19th: Cloud and Database configuration setup. Google Cloud Console leveraged for storage and MySQL used as database framework.
- October 19th to October 23rd: Unit tests for each endpoint created.
- October 23rd to October 
## Challenges and Lessons
- **Unit Tests**: When testing, creating a mock database would have been helpful and testing endpoint behavior more thouroughly, not only setup logic
- **Docker Setup**: Best practice to separate application components into different containers (frontend, backend, database)
- **Frontend Styling**: More packages should have been used and researched upon for a more dynamic presentation of product
- **Port Distribution**: Better understanding of port setup would have sped up whole development process
