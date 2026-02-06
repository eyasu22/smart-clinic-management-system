# 🔐 Super Admin Settings Module

## Overview
Enterprise-level system configuration and control panel exclusively for Super Admin users.

## Access
**URL:** `/super-admin/settings`  
**Role Required:** `superAdmin`  
**Navigation:** Visible as "Super Admin ⭐" in the sidebar (purple gradient)

---

## 📋 Sections

### 1. **System Configuration** 🌐
- **Clinic Name**: Customize platform branding
- **Timezone**: Global timezone setting (UTC, EST, GMT, GST, IST)
- **Default Language**: System-wide language (English, Arabic, Spanish, French)
- **Environment Mode**: Production or Demo mode
- **Maintenance Mode**: Emergency lockdown (blocks all non-superAdmin access)

### 2. **Security & Authentication** 🛡️
**Password Policy:**
- Minimum length (6-20 characters)
- Require uppercase letters
- Require numbers
- Require symbols

**Account Lockout:**
- Max failed login attempts (3-10)
- Lock duration (5-120 minutes)

**Additional Security:**
- ✅ Two-Factor Authentication (2FA)
- ✅ Force password change on first login
- ✅ Multi-device login control
- ✅ Refresh token rotation
- JWT expiration configuration

### 3. **Role & Permission Control** 👥
**Enabled Roles:**
- Super Admin
- Admin
- Receptionist
- Doctor
- Patient

**Access Controls:**
- Restrict Admin account creation (Super Admin only)
- Restrict Doctor account creation (Admin+ only)
- Control AI feature access per role

### 4. **Audit & Compliance** 📁
- Enable/disable audit logging
- Log retention period (30/90/180/365 days)
- Compliance modes:
  - None
  - HIPAA-like
  - GDPR-like
- Export audit logs (planned: CSV/PDF)

### 5. **Data Management** 💾
**Backup Configuration:**
- Frequency: Daily or Weekly
- Retention period: 7-90 days
- Manual backup trigger
- Restore from backup (with confirmation)

**Data Policies:**
- Soft delete (recoverable deletion)
- Patient data anonymization (GDPR compliance)

### 6. **AI & Intelligence Settings** 🧠
- **Master AI Toggle**: Enable/disable all AI features
- **Recommendation Sensitivity**:
  - Low (Conservative)
  - Medium (Balanced)
  - High (Aggressive)
- **AI Explainability**: Show reasoning behind recommendations
- **Assistive Only Mode**: AI cannot make final medical decisions (safety feature)

### 7. **Notification System Control** 🔔
**Channels:**
- In-app notifications
- Email notifications
- SMS notifications (optional)

**Rate Limiting:**
- Configure max notifications per hour (10-500)

**Emergency Broadcast:**
- Send urgent messages to all active users
- System-wide announcements

### 8. **System Health & Monitoring** 📊
**Real-time Metrics:**
- Server status (healthy/unhealthy)
- System uptime
- Database connection status
- Memory usage

**Monitoring Controls:**
- Enable health checks
- Enable performance alerts
- Auto-restart on failure (use with caution)

---

## 🎯 Features

### ✨ UI/UX
- **Tabbed Interface**: 8 organized sections
- **Dark Mode Support**: Full theme integration
- **Live Toggles**: Instant visual feedback
- **Smooth Animations**: Fade-in effects on tab changes
- **Color-coded Sections**: Visual hierarchy for different settings

### 🔒 Security
- Only Super Admin can access this page
- All changes require explicit "Save All Changes" action
- Dangerous actions (maintenance mode, auto-restart) have visual warnings
- Audit trail for all setting modifications

### 💡 Smart Defaults
- Pre-configured with secure, production-ready defaults
- HIPAA/GDPR-aware configurations available
- Progressive security levels

---

## 🚀 Usage

### Accessing the Settings
1. Log in as **Super Admin** (email: `superadmin@clinic.com`)
2. Click **"Super Admin ⭐"** in the sidebar (purple gradient button)
3. Navigate through tabs to configure different aspects

### Saving Changes
- Make changes across multiple tabs
- Click **"Save All Changes"** button (top-right)
- Confirmation message displays success/failure

### Emergency Actions

**Trigger Manual Backup:**
```
Navigate to: Data Management tab
Click: "Trigger Manual Backup"
Confirm: Dialog prompt
Result: Backup ID generated
```

**Emergency Broadcast:**
```
Navigate to: Notifications tab
Click: "Broadcast Emergency Message"
Enter: Your urgent message
Result: Message sent to all active users
```

**Enable Maintenance Mode:**
```
Navigate to: System Configuration tab
Toggle: Maintenance Mode
Save: Click "Save All Changes"
Effect: All users (except Super Admin) blocked from system
```

---

## 📡 API Endpoints

### GET `/api/admin/settings`
**Access:** Super Admin  
**Returns:** Current system settings object

### PUT `/api/admin/settings`
**Access:** Super Admin  
**Body:** Partial or full settings object  
**Returns:** Updated settings

### POST `/api/admin/settings/backup`
**Access:** Super Admin  
**Returns:** Backup ID and timestamp

### GET `/api/admin/settings/health`
**Access:** Super Admin  
**Returns:** System health metrics

### POST `/api/admin/settings/broadcast`
**Access:** Super Admin  
**Body:** `{ message: "Emergency announcement" }`  
**Returns:** Confirmation and recipient count

---

## 🗄️ Database Schema

Settings are stored in the `SystemSettings` collection with the following structure:

```javascript
{
  systemConfig: { clinicName, maintenanceMode, timezone, language, ... },
  security: { passwordPolicy, accountLockout, jwtExpiration, ... },
  roleControl: { enabledRoles, restrictAdminCreation, ... },
  audit: { enableAuditLogging, logRetentionDays, complianceMode },
  dataManagement: { backupFrequency, softDelete, ... },
  aiSettings: { enableAI, recommendationSensitivity, ... },
  notifications: { enableInApp, enableEmail, enableSMS, rateLimit },
  monitoring: { enableHealthChecks, autoRestartOnFailure },
  governance: { requireApprovalForDoctorRegistration, ... },
  lastUpdatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Note:** Only ONE settings document exists system-wide (singleton pattern).

---

## 🎨 Visual Indicators

- **Orange Background**: Warning actions (Maintenance Mode, Auto-Restart)
- **Red Background**: Critical security features (Account Lockout, AI Assistive Mode)
- **Green Background**: Positive features (Audit Logging, Health Checks)
- **Purple/Indigo Gradient**: AI and advanced features
- **Blue Background**: Data operations (Backups, Restores)

---

## ⚠️ Important Notes

1. **Maintenance Mode**: When enabled, ONLY Super Admin can access the system. Use carefully!
2. **Auto-Restart on Failure**: Experimental feature - can cause loops if misconfigured
3. **Compliance Modes**: These are behavioral flags - full HIPAA/GDPR compliance requires additional implementation
4. **Password Policy**: Changes apply to NEW passwords only, not existing ones
5. **AI Assistive Only**: Strongly recommended to keep ON for medical safety

---

## 🔧 Development Notes

### Adding New Settings
1. Update `backend/models/SystemSettings.js` schema
2. Add UI controls in `frontend/src/pages/SuperAdminSettings.jsx`
3. Document in this file

### Testing
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Login as Super Admin
Email: superadmin@clinic.com
Password: password123

# Navigate to: http://localhost:5173/super-admin/settings
```

---

## 📚 Future Enhancements

- [ ] Export audit logs as CSV/PDF
- [ ] IP whitelist/blacklist management UI
- [ ] Actual 2FA implementation
- [ ] Email/SMS provider configuration
- [ ] Real-time system metrics dashboard
- [ ] Scheduled maintenance windows
- [ ] Multi-language UI translations
- [ ] Role permission matrix editor
- [ ] Database query performance monitor

---

**Last Updated:** February 5, 2026  
**Version:** 1.0.0  
**Author:** Smart Clinic Development Team
