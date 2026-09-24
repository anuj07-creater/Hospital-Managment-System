# 🏥 Raut Hospital Management System (RHMS)

A full-stack hospital management web application designed to streamline patient registration, doctor management, appointment scheduling, authentication, and role-based hospital workflows.

🔗 **Live Demo:** https://hospital-managment-system-t5q1.onrender.com  
🔗 **GitHub:** https://github.com/anuj07-creater/Hospital-Managment-System

---

## 📌 Overview

**Raut Hospital Management System (RHMS)** is a full-stack web application developed to demonstrate how a real-world healthcare management platform can handle multiple user roles, secure authentication, appointment scheduling, and centralized data management.

The system provides dedicated workflows for:

- 👨‍💼 Administrator
- 👨‍⚕️ Doctor
- 🧑‍💼 Receptionist
- 👤 Patient

A key feature of RHMS is its **unified appointment scheduling system**, where online patient bookings and receptionist-created offline appointments use the same doctor availability.

The backend performs the final availability check to prevent **double booking of the same doctor, date, and time slot**.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Password hashing using bcryptjs
- Protected frontend routes
- Role-Based Access Control (RBAC)
- Separate permissions for Admin, Doctor, Receptionist, and Patient
- Secure environment-variable based configuration

### 📅 Unified Appointment Management

- Online appointment booking for patients
- Offline/walk-in appointment booking by receptionists
- Shared doctor availability between online and offline bookings
- Backend double-booking prevention
- Appointment status management
- Appointment cancellation
- Prevention of booking past time slots
- Prevention of duplicate patient bookings for the same doctor/date/time

### 👨‍⚕️ Doctor Management

- Doctor profiles
- Doctor specialization
- Consultation information
- Doctor availability
- Appointment management

### 🧑‍💼 Receptionist Workflow

- Patient registration
- Walk-in patient handling
- Offline appointment booking
- Appointment overview
- Doctor schedule visibility

### 👤 Patient Workflow

- Patient registration and login
- Browse available doctors
- Online appointment booking
- View appointment information
- Access personal healthcare information

### 📊 Role-Based Dashboards

Dedicated dashboard experiences for:

- Admin
- Doctor
- Receptionist
- Patient

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Doctor Dashboard
![Doctor Dashboard](screenshots/doctor-dashboard.png)

### Patient Appointment Booking
![Appointment Booking](screenshots/appointment-booking.png)

### Receptionist Dashboard
![Receptionist Dashboard](screenshots/receptionist-dashboard.png)

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- React Router
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs

### Database
- MongoDB Atlas
- Mongoose

### Development & Deployment
- Vite
- Git
- GitHub
- Render

---

## 🏗️ System Architecture

```text
                    RHMS WEB APPLICATION
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │                     │
                 │ React Router        │
                 │ Tailwind CSS        │
                 │ Axios               │
                 │ Role-Based Views    │
                 └──────────┬──────────┘
                            │
                       REST API
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Node.js + Express  │
                 │                     │
                 │ Authentication      │
                 │ RBAC Middleware     │
                 │ Controllers         │
                 │ Business Logic      │
                 │ Validation          │
                 └──────────┬──────────┘
                            │
                         Mongoose
                            │
                            ▼
                 ┌─────────────────────┐
                 │    MongoDB Atlas    │
                 │                     │
                 │ Users               │
                 │ Doctors             │
                 │ Patients            │
                 │ Appointments        │
                 │ Prescriptions       │
                 │ Medical Records     │
                 └─────────────────────┘

---

## 🧠 Key Engineering Logic

### Unified Appointment Scheduling

Both online patient bookings and offline receptionist bookings use the same appointment availability system.

```text
Patient Online Booking
          │
          ▼
      REST API
          │
          ▼
 Check Doctor Availability
          │
          ├── Slot Available → Create Appointment
          │
          └── Slot Taken → Reject Booking
          
Receptionist Offline Booking
          │
          ▼
      REST API
          │
          ▼
 Check Doctor Availability
          │
          ├── Slot Available → Create Appointment
          │
          └── Slot Taken → Reject Booking

---

## 📁 Project Structure

```text
Hospital-Managment-System/
├── server/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── src/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── README.md
├── bun.lock
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed before running RHMS locally:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- MongoDB Atlas account or a local MongoDB instance

### Installation

1. Clone the repository:

```bash
git clone https://github.com/anuj07-creater/Hospital-Managment-System.git

2. Navigate to the project directory:

cd Hospital-Managment-System

3. Install the project dependencies:

npm install --legacy-peer-deps

###Environment Variables

Create a .env file in the project root directory.

Use the provided .env.example file as a reference and configure the following variables:

PORT=3000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d

GEMINI_API_KEY=
APP_URL=http://localhost:3000

###Running Locally

Start the development server:
npm run dev

Once the server starts, open:
http://localhost:3000

##Production Build

To create a production build:
npm run build

To start the production server:
npm start
