# CampusPass – Enterprise-Grade Event Registration & Ticketing Platform

## Introduction

CampusPass is a comprehensive event registration, ticketing, and attendee management platform developed to digitize and automate the complete event lifecycle within educational institutions, technical festivals, conferences, workshops, and organizational gatherings.

The platform provides a centralized system for event organizers to create and manage events, sell tickets through both online and offline channels, validate attendee entries using QR-based authentication, generate detailed reports, and monitor event performance through real-time analytics.

By integrating secure payment processing, automated ticket generation, role-based access control, and QR-powered verification, CampusPass significantly reduces manual administrative effort while improving operational efficiency, accuracy, and attendee experience.

---

## Problem Statement

Many colleges and organizations continue to rely on fragmented processes for managing events. Registrations are often collected through forms, payments are tracked separately, tickets are manually verified, and attendance records are maintained independently.

Such approaches introduce several challenges:

* Duplicate registrations and data inconsistencies
* Manual verification delays during event entry
* Difficulty tracking ticket sales and revenue
* Limited visibility into attendance statistics
* Increased administrative workload
* Lack of centralized event management

CampusPass addresses these challenges by providing an integrated platform that combines registration, ticketing, payment processing, verification, and reporting into a single ecosystem.

---

## Objectives

The primary objectives of CampusPass are:

* Digitize the complete event registration workflow
* Simplify ticket sales and attendee management
* Enable secure online and offline payment collection
* Automate ticket generation and delivery
* Provide real-time attendee verification
* Reduce manual operational overhead
* Improve transparency through reporting and analytics
* Ensure scalability for events of varying sizes

---

## Core Features

### Event Lifecycle Management

The platform enables administrators to create, update, and manage events from a centralized dashboard. Multiple ticket categories can be configured for each event, allowing flexible pricing and participant segmentation.

Features include:

* Event creation and modification
* Ticket category management
* Pricing configuration
* Event scheduling
* Event status management

---

### Role-Based Access Control (RBAC)

CampusPass follows a role-driven architecture to ensure secure and controlled access to platform resources.

#### Administrator

Administrators have complete system control and can:

* Create and manage events
* Manage users
* Access analytics and reports
* Monitor ticket sales
* Oversee platform operations

#### Ticket Seller

Ticket Sellers are responsible for participant registrations and ticket issuance.

Capabilities include:

* Selling tickets
* Managing participant information
* Processing payments
* Generating tickets

#### Ticket Checker

Ticket Checkers validate attendee access during events.

Capabilities include:

* QR code verification
* Manual ticket validation
* Check-in management
* Entry monitoring

---

### Digital Ticketing System

Every ticket generated through CampusPass contains a uniquely identifiable serial number and a corresponding QR code.

The digital ticketing workflow ensures:

* Unique attendee identification
* Faster verification
* Reduced risk of duplication
* Simplified attendee tracking

Each ticket can be downloaded as a PDF document and shared electronically.

---

### QR-Based Verification

CampusPass incorporates QR-powered validation to streamline event entry operations.

The verification system supports:

* Camera-based QR scanning
* Instant ticket validation
* Manual serial number verification
* Duplicate entry prevention
* Real-time attendee status updates

This significantly reduces queue times and improves the overall event experience.

---

### Payment Processing Integration

To support secure financial transactions, CampusPass integrates with Razorpay.

Supported payment methods include:

* Online payments
* Cash transactions
* Payment confirmation workflows

The system maintains transaction records and enables revenue tracking for event organizers.

---

### Automated Communication System

CampusPass automatically communicates important information to attendees through email notifications.

Capabilities include:

* Ticket delivery emails
* PDF ticket attachments
* Confirmation notifications
* Automated communication workflows

The email service is powered through SMTP integration using Nodemailer.

---

### Reporting and Analytics

CampusPass provides administrators with visibility into event performance through an analytics dashboard.

Reporting capabilities include:

* Ticket sales reports
* Revenue analysis
* Attendance statistics
* Check-in summaries
* Event performance insights

These reports assist organizers in evaluating event success and making data-driven decisions.

---

## System Architecture

CampusPass follows a modern client-server architecture.

### Frontend Layer

The frontend is developed using React and Vite, providing a responsive and interactive user experience.

Responsibilities:

* User interface rendering
* Authentication workflows
* Dashboard visualization
* Event management operations
* QR verification interfaces

### Backend Layer

The backend is implemented using Node.js and Express.js.

Responsibilities:

* Business logic execution
* API management
* Authentication and authorization
* Ticket generation
* Payment processing
* Report generation

### Database Layer

Supabase PostgreSQL serves as the primary data storage system.

Responsibilities:

* User management
* Event records
* Ticket information
* Transaction history
* Attendance tracking

### External Services

The platform integrates with:

* Razorpay for payment processing
* Nodemailer for email delivery
* QR Code libraries for ticket generation
* PDFKit for PDF ticket creation

---

## Technology Stack

| Category                  | Technology          |
| ------------------------- | ------------------- |
| Frontend                  | React, Vite         |
| Backend                   | Node.js, Express.js |
| Database                  | Supabase PostgreSQL |
| Authentication            | JWT                 |
| Payment Gateway           | Razorpay            |
| Email Service             | Nodemailer          |
| QR Generation             | qrcode              |
| QR Scanning               | html5-qrcode        |
| Reporting & Visualization | Recharts            |
| PDF Generation            | PDFKit              |

---

## API Design

The backend exposes RESTful APIs that support:

* Authentication
* Event Management
* User Management
* Ticket Operations
* Payment Verification
* Ticket Validation
* Reporting and Analytics

The APIs are protected using JWT-based authentication and role-based authorization mechanisms.

---

## Security Considerations

CampusPass incorporates several security mechanisms:

* JWT-based user authentication
* Protected routes and middleware
* Role-based access restrictions
* Secure payment verification
* Unique ticket identifiers
* Duplicate check-in prevention

These measures help ensure system integrity and operational reliability.

---

## Scalability Considerations

The platform architecture is designed to support future expansion.

Potential scalability enhancements include:

* Cloud deployment
* Containerized services
* Microservice architecture
* Real-time notifications
* Mobile applications
* Advanced analytics dashboards
* AI-driven attendance forecasting

---

## Installation and Setup

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Local Access

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

---

## Contributors

This project was developed collaboratively as a team project.

Contributors:

* Arkapriya Das
* Krishna

---

## Acknowledgements

CampusPass was developed as a practical implementation of modern full-stack software engineering principles, combining secure authentication, event management workflows, payment integration, QR-based verification, and analytics into a unified platform.
