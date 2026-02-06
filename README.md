# 🏥 Smart Clinic Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Stack](https://img.shields.io/badge/stack-MERN-orange.svg)

**Smart Clinic Management System** is a comprehensive, enterprise-grade healthcare platform designed to streamline clinic operations. It digitizes the entire medical workflow, from patient registration and appointment scheduling to billing and medical record management, all wrapped in a modern, responsive user interface.

## 🚀 Key Features

### 👥 Multi-Role Access Control (RBAC)
*   **Super Admin / Admin**: Full system control, user management, audit logs, and system configuration.
*   **Doctors**: Manage appointments, view patient history, write prescriptions, and use AI tools.
*   **Receptionists**: Handle check-ins, schedule appointments, and manage billing.
*   **Patients**: Book appointments, view medical history, and pay bills.

### 🧠 AI-Powered Assistance
*   **Smart Chat Assistant**: Natural language chatbot to find patients, check schedules, and summarize notes.
*   **Clinical Summarization**: AI analysis of patient consultation notes for key insights.
*   **Schedule Optimization**: Smart recommendations for appointment slot allocation.
*   **Security Analysis**: Automomous detection of suspicious login patterns and risks.

### 📅 Advanced Appointment System
*   **Interactive Calendar**: Drag-and-drop scheduling (planned), day/week/month views.
*   **Status Tracking**: Manage lifecycle (Pending -> Confirmed -> Completed -> Cancelled).
*   **Reminders**: Automated notifications for upcoming visits.

### 💳 Billing & Finance
*   **Invoice Generation**: Create detailed invoices with tax and discount calculations.
*   **Payment Tracking**: Record cash, card, or insurance payments.
*   **Financial Reporting**: generated revenue reports and exportable CSV data.

### 🔔 Real-Time Notifications
*   **In-App Alerts**: Instant notifications for appointments, bills, and system broadcasts.
*   **Context Aware**: "Welcome" messages, payment confirmations, and emergency alerts.
*   **Broadcast System**: Admins can send urgent messages to all active users.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Security**: JWT Authentication, Bcrypt, Role-Based Middleware
*   **Tools**: Git, npm, Postman

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/eyasu22/smart-clinic-management-system.git
cd smart-clinic-management-system
```

### 2. Backward Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The app should now be running at `http://localhost:5173`.

## 📸 Screenshots
*(Add screenshots of your Dashboard, AI Chat, and Calendar here)*

## 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request for any feature additions or bug fixes.

## 📄 License
This project is licensed under the MIT License.

---
**Developed by [Eyasu22](https://github.com/eyasu22)**
