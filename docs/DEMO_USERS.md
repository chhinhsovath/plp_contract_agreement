# 🔐 Demo User Credentials

## Test Users for PLP Contract Agreement System

These demo users have been created for testing different contract types and roles in the system.

---

## 📋 Agreement-Specific Users (PARTNER Role)

Each user can only see their assigned contract type:

### 1. PMU-PCU Agreement
- **Phone**: `0771111111`
- **Passcode**: `1111`
- **Organization**: Provincial Coordination Unit
- **Position**: PCU Coordinator
- **Access**: Only PMU-PCU contracts and M&E data

### 2. PCU-Project Manager Agreement
- **Phone**: `0772222222`
- **Passcode**: `2222`
- **Organization**: Project Management Office
- **Position**: Project Manager
- **Access**: Only PCU-PM contracts and M&E data

### 3. Project Manager-Regional Agreement
- **Phone**: `0773333333`
- **Passcode**: `3333`
- **Organization**: Regional Coordination Office
- **Position**: Regional Coordinator
- **Access**: Only PM-Regional contracts and M&E data

### 4. DoE-District Office Agreement
- **Phone**: `0774444444`
- **Passcode**: `4444`
- **Organization**: District Office of Education
- **Position**: District Education Officer
- **Access**: Only DoE-District contracts and M&E data

### 5. DoE-School Agreement
- **Phone**: `0775555555`
- **Passcode**: `5555`
- **Organization**: Primary School
- **Position**: School Director
- **Access**: Only DoE-School contracts and M&E data

---

## 👨‍💼 Administrative Users

### Admin User
- **Phone**: `0776666666`
- **Passcode**: `6666`
- **Organization**: PLP Administration
- **Position**: System Administrator
- **Access**: Can view all contracts, manage indicators and activities

### Super Admin (Pre-existing)
- **Phone**: `077806680`
- **Passcode**: `6680`
- **Access**: Full system access including user management

---

## 🚀 Quick Testing Guide

### 1. Login at https://agreements.openplp.com/login

### 2. Test Different Views:
- **PARTNER users** see only their contract type in M&E dashboard
- **ADMIN user** can see all contracts and manage data
- **SUPER ADMIN** has full control including user management

### 3. Key Features to Test:
- ✅ View contracts filtered by type
- ✅ Access M&E dashboard with role-based data
- ✅ Create/edit indicators (Admin only)
- ✅ Add activities and track progress
- ✅ Enter data collection points
- ✅ Generate reports

### 4. M&E Dashboard Testing:
Each PARTNER user will see:
- Timeline specific to their contract type
- Indicators relevant to their agreement
- Activities they're responsible for
- Progress tracking for their deliverables

---

## 📝 Notes

- All demo users have active accounts
- Passwords are the last 4 digits of the phone number
- Users can be deactivated from the admin panel
- Demo data can be cleared by running database migrations

---

*Created for testing purposes only. Do not use these credentials in production.*