# Raut Hospital Management System (RHMS)

A production-ready full-stack MERN (MongoDB, Express, React, Node.js) Healthcare Management System architecture engineered with enterprise role-based access control (RBAC), multi-tier REST APIs, and a modern medical operations dashboard.

---

## 🏛️ System Architecture

```text
CLIENT (React 19 + Tailwind CSS)
   │
   ├── Context & State (AuthContext, RBAC guards)
   ├── Axios HTTP Client (Bearer Token Interceptors)
   └── Views & Dashboards (Admin, Doctor, Receptionist, Patient)
           │
           ▼ [REST API Requests /api/*]
SERVER (Node.js + Express)
   │
   ├── Middlewares (CORS, Express JSON, Auth Guard, RBAC Authorize, ErrorHandler)
   ├── Routing Layer (/api/auth, /api/doctors, /api/patients, /api/appointments, /api/stats)
   ├── Controllers (Request validation, payload processing, HTTP status responses)
   ├── Services (Business logic, scheduling conflict checks, password hashing, JWT)
   └── Data Layer (Mongoose Schemas & Models / Robust In-Memory Mock Store Fallback)
           │
           ▼
DATABASE (MongoDB / Mongoose ODM)
   ├── Users (Admin, Doctor, Receptionist, Patient)
   ├── Doctors (Specialties, Schedules, Consult Fee)
   ├── Patients (MRN, Demographics, Blood Group, Vitals)
   ├── Appointments (Online/Offline, Slots, Status)
   ├── Prescriptions (Rx items, dosage, diagnostics)
   └── MedicalRecords (Clinical notes, lab reports)
```

---

## 👥 User Roles & Permissions Matrix

| Feature / Domain | ADMIN | DOCTOR | RECEPTIONIST | PATIENT |
| :--- | :---: | :---: | :---: | :---: |
| **System Overview & Revenue** | ✅ | ❌ | ❌ | ❌ |
| **Staff & Doctor Management** | ✅ | ❌ | ❌ | ❌ |
| **Patient Registration (Walk-in)** | ✅ | ❌ | ✅ | ❌ |
| **Offline Desk Appointments** | ✅ | ❌ | ✅ | ❌ |
| **Online Appointment Booking** | ❌ | ❌ | ✅ | ✅ |
| **My Consultation Queue** | ❌ | ✅ | ❌ | ❌ |
| **Write Prescriptions & Notes** | ❌ | ✅ | ❌ | ❌ |
| **Access Personal Medical History**| ❌ | Read Assigned | Read Demographics | ✅ Self |

---

## ⚙️ Tech Stack

- **Frontend**: React 19, React Router v7, Axios, Tailwind CSS v4, Lucide Icons, Recharts, Motion.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), bcryptjs.
- **Database**: MongoDB & Mongoose ODM (with automatic fallback to seeded memory store when `MONGODB_URI` is not connected).
- **Tooling**: Vite, TypeScript, tsx, esbuild.

---

## 🚀 Environment Variables (`.env`)

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/raut_hospital_db
JWT_SECRET=rhms_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE=7d
```

---

## 🧪 Quick Start & Demo Credentials

Pre-seeded accounts are provided for instant evaluation across all 4 roles:

- **Admin**: `admin@raut-hospital.org` / `admin123`
- **Doctor**: `dr.sarah@raut-hospital.org` / `doctor123`
- **Receptionist**: `reception@raut-hospital.org` / `reception123`
- **Patient**: `patient.rahul@gmail.com` / `patient123`
