
# Software Requirements Specification (SRS)

## Project Name
CivicRelief – Integrated Civic Issue Reporting & Disaster Response Platform

## 1. Introduction

### 1.1 Purpose
CivicRelief provides a common platform for citizens to report civic problems and disaster-related incidents.

### 1.2 Scope
The system contains two modules:

- CivicCare: Reports potholes, garbage, broken streetlights and water leakage.
- ReliefConnect: Records emergency incidents and supports future volunteer, shelter and resource coordination.

### 1.3 Intended Users
- Citizens
- Administrators
- Volunteers
- Relief coordinators

## 2. Overall Description

The system uses a React frontend, FastAPI backend and PostgreSQL database.

Citizens submit reports through the interface. The backend validates the information and stores reports in the database. Administrators will be able to review and manage reports in a future module.

## 3. Functional Requirements

FR-01: The system shall allow citizens to submit reports.

FR-02: The system shall support civic and emergency report categories.

FR-03: The system shall validate report information.

FR-04: The system shall store submitted reports in PostgreSQL.

FR-05: The system shall display submitted reports.

FR-06: The system shall allow retrieval of an individual report.

FR-07: The system shall maintain a report status.

FR-08: The future administration module shall support report verification and assignment.

## 4. Non-Functional Requirements

NFR-01: Usability – The interface should be simple and responsive.

NFR-02: Performance – API requests should return within an acceptable response time.

NFR-03: Security – Input validation and access control must be implemented.

NFR-04: Reliability – Reports should be stored persistently.

NFR-05: Maintainability – The application should use modular architecture.

NFR-06: Scalability – The architecture should support future increases in users and reports.

## 5. Technology Stack

Frontend: React + Vite

Backend: Python + FastAPI

Database: PostgreSQL

ORM: SQLAlchemy

Testing: pytest

Version Control: Git and GitHub

## 6. Constraints

- Internet connectivity is required for remote deployment.
- Emergency dispatch is not integrated in the current prototype.
- Authentication and role-based access control are future enhancements.

## 7. Future Enhancements

- Citizen registration and login
- Image uploads and location mapping
- Administrator dashboard
- Volunteer coordination
- Shelter and resource management
- Notifications
- Telugu and English language support
