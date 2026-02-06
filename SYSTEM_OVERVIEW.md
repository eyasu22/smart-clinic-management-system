# Smart Clinic Management System - System Overview

## 1. System Functionality Summary
The **Smart Clinic Management System** is a full-stack MERN application (MongoDB, Express, React, Node.js) designed to manage modern healthcare practices using role-based access control.

### **Core Modules (Enterprise Enhanced)**
1.  **Authentication & Security** (Enterprise Grade)
    *   **JWT Authentication:** Secure login with token-based sessions.
    *   **RBAC (Role-Based Access Control):** 5 Distinct roles (Super Admin, Admin, Doctor, Receptionist, Patient).
    *   **Account Lockout:** Automatically locks account for 15 minutes after 5 failed attempts.
    *   **Login History:** Tracks IP and Device for every successful login.
    *   **Granular Permissions:** Custom permission tags for fine-grained control.
    *   **Audit Logging:** Every critical admin action is recorded.

2.  **Public Interface**
    *   **Landing Page:** Responsive, modern UI explaining features.
    *   **Login/Signup:** Functional forms connected to the backend.

3.  **Dashboard**
    *   **Real-time Stats:** API endpoints to fetch total patients, appointments, and revenue.

4.  **Admin Management**
    *   **User Management:** Create/Edit Admins with `isActive` (Soft Delete).
    *   **Audit History:** View system-wide logs for compliance.

5.  **Clinical Modules**
    *   **Doctor Availability:** Manage working days and `maxPatientsPerDay`.
    *   **Patient Records:** Store medical history and contact info.
    *   **Clinical Notes:** Doctors can add `Diagnosis`, `Visit Notes`, and `Prescription` to appointments.

6.  **Notifications**
    *   **In-App Alerts:** Patients receive notifications when appointment status changes (Pending -> Confirmed).

7.  **AI-Assisted Modules (New)**
    *   **Clinical Summarization:** Summarizes doctor notes into structured medical records (Doctor).
    *   **Smart Scheduling:** Analyzing doctor load to suggest optimal appointment slots (Admin/Receptionist).
    *   **Patient Trends:** Highlights visit history patterns and recurring symptoms (Doctor).
    *   **Security Analytics:** Detects anomalous login patterns and critical data deletions (Admin).
    *   **Smart Search:** Natural language search for patients and appointment records (Staff).


---

## 2. User Roles & Capabilities

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | **System Owner** | • Create/Delete Admins <br> • View Audit Logs <br> • Full System Control <br> • Manage all Users |
| **Admin** | **Operational** | • Manage Doctors/Staff <br> • Basic Reporting <br> • Clinic Configuration |
| **Doctor** | **Clinical** | • Access Medical Records <br> • Prescribe Medication <br> • View Own Schedule |
| **Receptionist** | **Front Desk** | • Register Patients <br> • Book Appointments <br> • Update Appt Status <br> • No Medical Data Access |
| **Patient** | **Restricted** | • Book Appointments <br> • View Own History |

---

## 3. Patient Module Definition
The **Patient Module** is designed for privacy, security, and ease of access.

### **Responsibilities**
1.  **Account Management:**
    *   Public registration & Secure Login.
    *   Profile Management (Personal Info, Contact, Blood Group).
2.  **Appointments:**
    *   **Booking:** View doctor availability and book slots.
    *   **Management:** View status (Pending, Confirmed) and cancel pending requests.
    *   **History:** Access past visit records.
3.  **Medical Records (Read-Only):**
    *   View diagnoses, prescriptions, and visit notes from Doctors.
    *   *Restriction:* Patients cannot edit these records.
4.  **Privacy & Security:**
    *   **RBAC Enforced:** strictly limited to own data (`req.user._id` checks).
    *   **No Admin Access:** Blocked from all admin routes.

---

## 4. Doctor Module Definition
The **Doctor Module** focuses on clinical efficiency, specialization, and AI-assisted care.

### **Account & Profile**
*   **Creation:** Accounts are created **strictly by Admins**.
*   **Profile Data:** Specialization, License Number, Availability, Max Patients/Day.
*   **Security:** Forced password change on first login.

### **Responsibilities**
1.  **Appointment Management:**
    *   View schedule filtered by **Specialization**.
    *   Accept/Decline pending appointments based on `currentLoad`.
2.  **Clinical Workflow:**
    *   **Access Control:** View records *only* for assigned patients.
    *   **Consultation:** Add Diagnosis, Visit Notes, Prescriptions.
3.  **AI Capabilities:**
    *   **Visit Summarizer:** Auto-generate summaries for complex cases.
    *   **Patient Recommendations:** System suggests patients who need follow-ups based on medical history & doctor's specialty.

### **Restrictions**
*   No access to Admin Dashboards, User Management, or Audit Logs.
*   Cannot assign patients outside their specialization.

---

## 5. Admin Module Definition
The **Admin Module** is the central control hub for the Smart Clinic.

### **Responsibilities**
1.  **User Management:**
    *   **Create/Manage Users:** Register Doctors (with credentials), Receptionists, and verify Patients.
    *   **Role Management:** Assign/Update roles.
    *   **Security:** Lock/Unlock accounts, Force password resets.
2.  **System Monitoring:**
    *   **Dashboard:** Real-time stats (Total Users, Active Appointments, System Load).
    *   **Audit Logs:** View detailed logs of *all* critical actions (who did what, when).
3.  **Configuration:**
    *   Manage clinic settings (Operating hours, Default fees).
4.  **AI Oversight:**
    *   View "Security Alerts" generated by the AI (e.g., brute force attacks).

---

## 6. How to Use & Test

### **A. Initial Setup (Done)**
A **Super Admin** account has been seeded into the database for you to control the system.

*   **Email:** `superadmin@clinic.com`
*   **Password:** `password123`

### **B. Testing the API**
You can use **Postman** or the **Frontend** to interact with the system.

#### **Key API Endpoints:**
*   `POST /api/users/login` - Login to get a token.
*   `GET /api/dashboard/stats` - Get clinic statistics (Requires Token).
*   `POST /api/admin/users` - Create a new Admin (Requires Super Admin Token).
*   `GET /api/admin/audit-logs` - View security logs.

---

## 4. Pending Implementation (Roadmap)
The backend logic is robust. The following Frontend interfaces need to be built to match the backend power:
*   **Admin Dashboard UI:** A page to view the Audit Logs and Manage Users table.
*   **Appointment Booking Form:** A UI for patients to select dates/doctors.
*   **Patient List:** A specific view for Doctors to see their patients.
