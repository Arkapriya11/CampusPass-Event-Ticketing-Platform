# CampusPass – Interactive Event Registration & Ticketing Platform

## Overview

CampusPass is a full-stack event registration, ticketing, and attendee management platform designed to simplify and automate the complete event lifecycle for colleges, universities, conferences, workshops, technical festivals, and organizational events.

The platform provides a centralized ecosystem for event creation, participant registration, ticket sales, payment processing, attendee verification, reporting, and administrative management. By integrating QR-based ticket validation, automated communication systems, role-based access control, and analytics dashboards, CampusPass eliminates the inefficiencies associated with traditional event management processes.

In addition to its operational capabilities, CampusPass incorporates an immersive 3D-powered landing experience that enhances user engagement through interactive visual components, dynamic animations, and modern UI design principles.

---

## Problem Statement

Event management in educational institutions is frequently fragmented across multiple tools and manual processes. Registrations are collected through forms, payments are managed separately, attendee verification is performed manually, and analytics are often unavailable or inaccurate.

Common challenges include:

* Manual attendee verification
* Duplicate registrations
* Payment reconciliation difficulties
* Long entry queues during events
* Lack of centralized management
* Limited visibility into attendance and revenue metrics
* Administrative overhead

CampusPass addresses these issues by integrating registration, ticketing, payment processing, attendee validation, communication, and reporting into a single unified platform.

---

## Objectives

The primary objectives of CampusPass are:

* Digitize event registration workflows
* Automate ticket generation and validation
* Enable secure online and offline ticket sales
* Improve attendee check-in efficiency
* Provide real-time event analytics
* Reduce operational overhead
* Improve event management scalability
* Deliver an engaging user experience

---

## Core Features

### Interactive 3D Experience

CampusPass incorporates a visually immersive landing experience featuring modern frontend technologies and interactive visual elements.

Features include:

* Interactive 3D scene rendering
* Animated visual effects
* Dynamic particle systems
* Glassmorphism-inspired interface design
* Responsive user experience
* Modern visual storytelling components

This enhances platform usability while demonstrating advanced frontend engineering practices.

---

### Event Lifecycle Management

Administrators can manage events from a centralized dashboard.

Capabilities include:

* Event creation and modification
* Ticket category management
* Pricing configuration
* Event scheduling
* Event status tracking

---

### Role-Based Access Control (RBAC)

CampusPass implements secure role-based authorization with three operational roles.

#### Administrator

* Manage events
* Manage users
* Access reports and analytics
* Monitor ticket sales
* Configure platform operations

#### Ticket Seller

* Register participants
* Sell tickets
* Process payments
* Generate attendee tickets

#### Ticket Checker

* Validate attendee tickets
* Perform event check-ins
* Monitor venue entry
* Prevent duplicate attendance

---

### Digital Ticketing System

The platform automatically generates unique tickets for every registration.

Features include:

* Unique ticket serial numbers
* QR code generation
* Digital ticket delivery
* PDF ticket generation
* Secure attendee identification

---

### QR-Based Validation & Check-In

CampusPass supports real-time attendee verification through QR-powered validation workflows.

Capabilities include:

* Camera-based QR scanning
* Instant ticket validation
* Manual serial number verification
* Duplicate entry prevention
* Live attendee status updates

---

### Payment Processing Integration

The platform integrates Razorpay to support secure transaction processing.

Supported workflows include:

* Online payments
* Offline cash transactions
* Payment verification
* Revenue tracking
* Transaction management

---

### Automated Email Communication

CampusPass automates attendee communication using integrated email workflows.

Features include:

* Registration confirmations
* Ticket delivery emails
* PDF ticket attachments
* HTML email templates
* Automated notifications

---

### Reporting & Analytics

Administrators gain access to event performance insights through integrated dashboards.

Available reports include:

* Revenue summaries
* Ticket sales analytics
* Attendance reports
* Check-in statistics
* Event performance metrics

---

## System Architecture

CampusPass follows a modern client-server architecture.

### Frontend Layer

Built using React and Vite.

Responsibilities:

* User interface rendering
* Authentication workflows
* Dashboard visualization
* Event management interactions
* QR validation interfaces
* 3D visual experiences

### Backend Layer

Built using Node.js and Express.js.

Responsibilities:

* Business logic execution
* API management
* Authentication and authorization
* Ticket generation
* Payment processing
* Reporting services

### Database Layer

Powered by Supabase PostgreSQL.

Responsibilities:

* User data management
* Event records
* Ticket storage
* Payment tracking
* Attendance monitoring

### External Integrations

* Razorpay Payment Gateway
* Nodemailer Email Service
* QR Code Generation Libraries
* PDFKit Document Generation

---

## Technology Stack

| Category           | Technology          |
| ------------------ | ------------------- |
| Frontend           | React, Vite         |
| Backend            | Node.js, Express.js |
| Database           | Supabase PostgreSQL |
| Authentication     | JWT                 |
| Payment Gateway    | Razorpay            |
| Email Service      | Nodemailer          |
| QR Generation      | qrcode              |
| QR Validation      | html5-qrcode        |
| Data Visualization | Recharts            |
| PDF Generation     | PDFKit              |

---

## Project Structure

```text
campuspass/
├── backend/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── lib/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

---

## API Modules

The backend exposes RESTful APIs supporting:

* Authentication
* Event Management
* User Management
* Ticket Operations
* Payment Verification
* Check-In Validation
* Reporting & Analytics

All protected endpoints are secured through JWT-based authentication and role-based authorization.

---

## Security Features

CampusPass incorporates several security mechanisms:

* JWT Authentication
* Role-Based Access Control
* Protected API Routes
* Secure Payment Verification
* Unique Ticket Identification
* Duplicate Check-In Prevention

---

## Installation & Setup

### Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Local Access

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=your-secret-key

RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

FRONTEND_URL=http://localhost:5173
```

---

## Test Credentials

| Role    | Email                                                   | Password   |
| ------- | ------------------------------------------------------- | ---------- |
| Admin   | [admin@campuspass.com](mailto:admin@campuspass.com)     | admin123   |
| Seller  | [seller@campuspass.com](mailto:seller@campuspass.com)   | seller123  |
| Checker | [checker@campuspass.com](mailto:checker@campuspass.com) | checker123 |

---

## Scalability & Future Enhancements

Potential future improvements include:

* Mobile application support
* Multi-event organization management
* SMS-based ticket delivery
* Cloud-native deployment
* Advanced analytics dashboards
* Real-time notifications
* AI-powered attendance forecasting
* Event recommendation systems

---

## Contributors

This project was developed collaboratively as a team project.

Contributors:

* Arkapriya Das
* Vineel Krishna

---

## Acknowledgements

CampusPass represents the practical application of modern full-stack software engineering principles, integrating secure authentication, event management workflows, payment processing, QR-based validation, reporting systems, and immersive frontend experiences into a unified platform.
