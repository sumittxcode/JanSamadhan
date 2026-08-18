# 🇮🇳 JanSamadhan – Citizen Grievance Redressal System

JanSamadhan is a full-stack **Citizen Grievance Redressal System** designed to provide a digital platform where citizens can submit complaints/grievances and track their status, while Department Officers can view and manage complaints assigned to their department.

The system provides separate dashboards for **Citizens, Department Officers, and Administrators**, making the grievance management process more organized, transparent, and efficient.

---

## 🚀 Features

### 👤 Citizen Portal

- Citizen registration and login
- Secure authentication using JWT
- Citizen dashboard
- Submit new grievances/complaints
- Select complaint category
- Add complaint title and description
- Track submitted complaints
- View complaint status
- View complaint details
- Monitor grievance progress
- Notifications for important updates
- Edit/delete eligible complaints

### 🧑‍💼 Department Officer Portal

- Secure officer login
- Dedicated Officer Resolution Desk
- Automatically view complaints related to the officer's department
- Search complaints
- Filter complaints by status and priority
- View complaint details
- Manage assigned complaints
- Update complaint status
- Add remarks/updates
- Track pending, in-progress and resolved complaints

### 👨‍💻 Admin Portal

- Admin authentication
- Admin dashboard
- Manage users
- Manage department officers
- Manage complaint categories
- Assign complaints to departments/officers
- Monitor complaint activity
- View system activity logs
- Manage grievance workflow

### 🔔 Notification System

- Notifications for important grievance events
- Complaint creation notifications
- Complaint assignment notifications
- Status/update notifications
- Notification data stored in MongoDB

### 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control
- Separate access for Citizens, Officers and Admins
- Protected routes
- Environment variables for sensitive configuration
- Password-based authentication

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- React Context API
- Lucide React
- Axios / Fetch API

### Backend

- Node.js
- Express.js
- JavaScript
- REST APIs
- JWT Authentication
- Middleware-based authorization

### Database

- MongoDB
- Mongoose

### Development Tools

- Git
- GitHub
- Visual Studio Code
- MongoDB Compass
- Vite Development Server
- Nodemon

---

## 🏗️ Project Architecture

```text
JanSamadhan/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   │       ├── AdminCategories.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminLogs.jsx
│   │       ├── AdminUsers.jsx
│   │       ├── CitizenDashboard.jsx
│   │       ├── ComplaintDetails.jsx
│   │       ├── EditComplaint.jsx
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── OfficerDashboard.jsx
│   │       ├── Profile.jsx
│   │       ├── Register.jsx
│   │       └── SubmitComplaint.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md


