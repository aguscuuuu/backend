# Backend I – Coderhouse

Backend **REST API** project designed to manage products and shopping carts using **MongoDB Atlas (cloud)** as the primary data persistence layer. The project focuses on core backend concepts such as routing, controllers, database integration, environment configuration, and modular architecture using Node.js and Express.

The structure is intentionally clean and scalable, making it suitable both for learning purposes and as a solid base for more advanced backend features such as authentication, authorization, validation, and deployment.

---

## Run
To execute the project locally, follow the steps below. All steps are required.

### 1. Clone the repository
```sh
git clone https://github.com/aguscuuuu/backend.git
```
This downloads the complete codebase, including server configuration, routes, controllers, and database connection logic.

## 2. Install dependencies
```sh
npm install
```
This installs all required Node.js dependencies defined in `package.json`.

## 3. Environment variables configuration
This project uses environment variables for configuration. The `.env` file is intentionally excluded from version control for security reasons. Create your own `.env` file from the project root: 
```sh
cp .env.example .env
```
Then edit .env and provide your own values:
```sh
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/backend
```
>You must create your own MongoDB Atlas cluster and database user. The database will be created automatically on first connection.

## 4. Start the server
```sh
npm start
```
This command:
- Loads environment variables
- Initializes the Express server
- Connects to MongoDB Atlas
- Mounts API routes
- Starts listening for HTTP requests

By default, the server runs on port `8080`.

>You can change this value inside `server.js` if you need the API to run on another port.

## 5. Access the API
```sh
http://localhost:8080/
```
This endpoint acts as a health check to verify that the API is running correctly.

## Status

*In progress.*
- **Version:** `1.0.0`
- **Date:** `Jan 2026`

New features, validations, error handling improvements, and module expansions are actively being developed.

- **Language:** `English`

## Access

- **Repository:** https://github.com/aguscuuuu/backend  
- **Deployment:** *(pending)*

## Used Technologies

- **Language:** JavaScript
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose
- **Environment config:** dotenv

## Developers & Contributors

- **Agustin Cuenca** (`AgustinCuenca` `aguabentura08@gmail.com`) — *Main Developer*

## License

This work has been dedicated to the public domain under the **Creative Commons CC0 1.0 Universal Public Domain Dedication**.

To the extent possible under law, the author has waived all copyright and related or neighboring rights.

> You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

**© 2025 cueCode Software.**

 
                                       ______          __              
                      _______  _____  / ____/___  ____/ /__            
                     / ___/ / / / _ \/ /   / __ \/ __  / _ \           
                   / /__/ /_/ /  __/ /___/ /_/ / /_/ /  __/                  
                    \___/\__,_/\___/\____/\____/\__,_/\___/  _____    
                      / ___/____  / __/ /__      ______ _________      
                      \__ \/ __ \/ /_/ __/ | /| / / __ `/ ___/ _ \     
                     ___/ / /_/ / __/ /_ | |/ |/ / /_/ / /  /  __/     
                    /____/\____/_/  \__/ |__/|__/\__,_/_/   \___/  
