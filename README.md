# Note-Taking App

This is a simple note-taking application built using Parse Server, MongoDB, and Docker. The application allows users to create, update, delete, and share notes. It also includes user authentication, role management, and a basic cloud code setup.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features
- User signup, login, and logout
- Note creation, update, deletion, and sharing with other users
- Role-based access control (User and Admin roles)
- MongoDB as the database
- Dockerized for easy setup and deployment

## Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (Optional, if running outside Docker)

## Setup

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Aliac8888/note_taking_app_server.git
    cd note-taking-app
    ```

2. **Set up environment variables:**
    - Create a `.env` file in the root directory (if already not have it) and add the following:
    ```bash
    DATABASE_URI=mongodb://mongodb:27017/dev
    APP_ID=myAppId
    MASTER_KEY=myMasterKey
    SERVER_URL=http://localhost:1337/parse
    ```

3. **Install dependencies:**
    - If you're running locally, install the dependencies using npm:
    ```bash
    npm install
    ```

## Usage

### Running Locally

1. **Start MongoDB**

2. **Start the application:**
    ```bash
    npm start
    ```

### Running Using Docker

- **Build the Docker image:**
    ```bash
    docker build -t note-taking-app-server .
    ```

- **Run the Docker container using docker-compose:**
    ```bash
    docker compose up --build
    ```

- **View logs:**
    ```bash
    docker logs note-taking-app-server
    ```    

## Environment Variables

- `DATABASE_URI`: The MongoDB connection string.
- `APP_ID`: The Parse App ID.
- `MASTER_KEY`: The master key for Parse Server.
- `SERVER_URL`: The server URL where Parse is running.

## API Endpoints

- **Signup:** `POST /parse/functions/userSignup`
- **Login:** `POST /parse/functions/userLogin`
- **Logout:** `POST /parse/functions/userLogout`
- **Delete User:** `POST /parse/functions/deleteUser`
- **Create Note:** `POST /parse/functions/createNote`
- **Get Notes:** `POST /parse/functions/getMyNotes`
- **Update Note:** `POST /parse/functions/updateNote`
- **Delete Note:** `POST /parse/functions/deleteNote`
- **Share Note:** `POST /parse/functions/shareNote`

Refer to the cloud code for the full list of available functions and how to use them or the postman document : https://documenter.getpostman.com/view/27413876/2sA3s9D8aY#6bee7813-af89-4eeb-9d98-1cd0b71bdc1d.

## Contributing

Feel free to open issues or submit pull requests if you find any bugs or have ideas for improvements.

## License

This project is licensed under the MIT License.
