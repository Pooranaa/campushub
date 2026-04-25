# How to Run the Project

## 1. Create the Database

1. Open MySQL Workbench or MySQL Command Line.
2. Run the SQL file:

```sql
SOURCE New project/backend/database/schema.sql;
```


## 2. Configure Backend Environment Variables

1. Open the `backend` folder.
2. Create a `.env` file using `.env.example`.
3. Add your database and email configuration.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campushub
JWT_SECRET=campushub_super_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=CampusHub <your_email@gmail.com>
PUBLIC_BASE_URL=http://localhost:5000
```

## 3. Install Backend Dependencies

Open terminal in the `backend` folder and run:

```bash
npm.cmd install
```

## 4. Start the Backend

In the `backend` folder, run:

```bash
npm.cmd run dev
```

Backend will run on:

```text
http://localhost:5000
```

## 5. Install Frontend Dependencies

Open another terminal in the `frontend` folder and run:

```bash
npm.cmd install
```

## 6. Start the Frontend

In the `frontend` folder, run:

```bash
npm.cmd start
```

Frontend will run on:

```text
http://localhost:3000
```

## 7. Use the Application

1. Open `http://localhost:3000`
2. Register a user account
3. Login with the created account
4. Use the dashboard based on the selected role
