# CampusHub

CampusHub is a beginner-friendly full-stack web application for managing college department and club activities.

## Project Structure

```text
CampusHub/
  backend/
    config/        -> MySQL connection
    controllers/   -> API logic
    database/      -> SQL schema
    middleware/    -> JWT auth and file upload helpers
    models/        -> Database queries
    routes/        -> API endpoints
    server.js      -> Express entry file
  frontend/
    public/
    src/
      components/  -> Reusable UI parts
      pages/       -> Page-level components
      services/    -> Axios API helper
      App.js       -> Main frontend app
```

## Step 1: Create the Database

1. Open MySQL Workbench or the MySQL command line.
2. Run [schema.sql](/C:/Users/poorn/OneDrive/Documents/New%20project/backend/database/schema.sql).
3. This creates the `campushub` database and all required tables.
4. It also adds sample departments and clubs so you can start testing quickly.

Main tables created:

- `users`
- `departments`
- `clubs`
- `events`
- `event_registrations`
- `recruitments`
- `recruitment_applications`
- `volunteers`
- `attendance`
- `certificates`

## Step 2: Start the Backend

1. Open a terminal in [backend](/C:/Users/poorn/OneDrive/Documents/New%20project/backend).
2. Create a new file named `.env` by copying values from [backend/.env.example](/C:/Users/poorn/OneDrive/Documents/New%20project/backend/.env.example).
3. Update your MySQL password and JWT secret.
4. On Windows PowerShell, run `npm.cmd install`.
5. Start the backend with `npm.cmd run dev`.

The backend will run on `http://localhost:5000`.

## Step 3: Test the Backend APIs

Important endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/events`
- `POST /api/events`
- `POST /api/events/register`
- `GET /api/clubs`
- `POST /api/clubs/recruitment`
- `POST /api/volunteer/apply`
- `GET /api/user/dashboard`

Example register request:

```json
POST /api/auth/register
{
  "name": "Asha",
  "email": "asha@example.com",
  "password": "123456",
  "role": "student"
}
```

Example login request:

```json
POST /api/auth/login
{
  "email": "asha@example.com",
  "password": "123456"
}
```

## Step 4: Start the Frontend

1. Open a second terminal in [frontend](/C:/Users/poorn/OneDrive/Documents/New%20project/frontend).
2. Run `npm.cmd install`.
3. Start React with `npm.cmd start`.

The frontend will run on `http://localhost:3000`.

## Step 5: How the Project Flows

1. React form sends data with Axios from [api.js](/C:/Users/poorn/OneDrive/Documents/New%20project/frontend/src/services/api.js).
2. Express route receives the request.
3. Controller processes the request.
4. Model runs SQL queries in MySQL.
5. Response goes back to React and is shown on screen.

## Learning Notes

- [server.js](/C:/Users/poorn/OneDrive/Documents/New%20project/backend/server.js) starts the Express app.
- [authMiddleware.js](/C:/Users/poorn/OneDrive/Documents/New%20project/backend/middleware/authMiddleware.js) checks JWT tokens and user roles.
- [eventController.js](/C:/Users/poorn/OneDrive/Documents/New%20project/backend/controllers/eventController.js) contains event-related backend logic.
- [App.js](/C:/Users/poorn/OneDrive/Documents/New%20project/frontend/src/App.js) controls which page is shown.
- QR codes are generated when a student registers for an event.
- Passwords are hashed with `bcrypt`, which means we never save plain-text passwords.
