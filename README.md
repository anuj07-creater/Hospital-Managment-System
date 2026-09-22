# 🏥 Raut Hospital Management System (RHMS)

A full-stack hospital management web application designed to streamline patient registration, doctor management, appointments, authentication, and role-based hospital workflows.

🔗 **Live Demo:** https://hospital-managment-system-t5q1.onrender.com  
🔗 **GitHub:** https://github.com/anuj07-creater/Hospital-Managment-System

---

## 📌 Overview

**Raut Hospital Management System (RHMS)** is a full-stack web application built to demonstrate how a real-world healthcare management platform can handle multiple user roles, secure authentication, appointment scheduling, and centralized data management.

The system provides separate workflows for:

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
- Protected routes
- Role-Based Access Control (RBAC)
- Separate access permissions for Admin, Doctor, Receptionist, and Patient
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
- Specialization
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

- Patient registration/login
- Browse available doctors
- Book appointments online
- View appointment information
- Access personal healthcare information

### 📊 Role-Based Dashboards

Dedicated dashboard experiences for:

- Admin
- Doctor
- Receptionist
- Patient

---

## 🏗️ System Architecture

```text
                    RHMS WEB APPLICATION
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │ React Router        │
                 │ Tailwind CSS        │
                 │ Axios               │
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
