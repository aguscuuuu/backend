# Backend I - Coderhouse

Backend **REST API** project designed to manage products and shopping carts using JSON files as a lightweight storage mechanism. This project aims to provide a clear and practical introduction to server-side development, focusing on routing, data handling, file-based persistence, and modular architecture. It serves as an excellent foundation for learners who are starting with backend concepts or for developers who need a simple environment for rapid prototyping.

The structure is intentionally minimalistic to make it easy to understand, extend, and refactor. Throughout the codebase, the logic is organized using managers, routers, and a clean separation of concerns, allowing the project to scale naturally as new functionalities are introduced.

---

### Run

To execute the project locally, follow these steps. Each action is required to ensure the environment is properly prepared and the server runs without errors.

**1.** Clone the repository to obtain a local copy of the project files. Open a command terminal somewhere on the file system and type:
```sh
git clone https://github.com/aguscuuuu/backend.git
```
Cloning is necessary because it downloads the entire codebase, including the server configuration, routers, managers, and data files used by the API.

**2.** Install all project dependencies listed in `package.json`.
```sh
npm install
```
This step ensures that **Node.js** downloads and prepares the required libraries. Without these dependencies (such as Express or UUID), the server would not be able to start or function correctly.

**3.** Start the server from the project’s root directory.
```sh
node server/server.js
```
Running this command initializes the **Express** application, sets up middleware, mounts all routes, and begins listening for incoming **HTTP requests**. If the folder structure is modified, the path must be adjusted accordingly.

The server listens on port `8080` by default. 
>You can change this value inside `server.js` if you need the API to run on another port.

**4.** Open the main route in your browser.
```sh
localhost:8080/
```
Accessing this URL allows you to confirm that the server is running and properly responding to HTTP requests. The root endpoint typically returns a basic message indicating that the API is active, serving as a quick health check for the application. From this point, you can begin navigating through the available routes or start testing more complex endpoints using tools such as Postman, Thunder Client, or cURL.

---

### Status

*In progress.*
- **Version:** `1.0.0`
- **Date:** `Nov 2025`

New features, validations, error handling improvements, and module expansions are actively being developed.

- **Language:** `English`

---

### Access

- **Repository:** https://github.com/aguscuuuu/backend  
- **Deployment:** *(pending)*

---

### Used Technologies

- **Languages:** JavaScript  
- **Libraries | Frameworks:** Node Js | Express | UUID
- **Databases:** JSON file-based persistence (no database yet)

Additional technologies may be incorporated as the project evolves, such as MongoDB or PostgreSQL for data persistence, template engines, or authentication libraries.

---

### Developers & Contributors

- **Agustin Cuenca** (`AgustinCuenca` `aguabentura08@gmail.com`) — *Main Developer*

---

### License

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
