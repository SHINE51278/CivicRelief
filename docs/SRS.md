# Software Requirements Specification (SRS)

# CivicRelief &  Integrated Civic Issue Reporting & Disaster Response Platform

## 1. Introduction

### 1.1 Purpose

CivicRelief is a web-based platform designed to help citizens report everyday civic problems and emergency-related incidents. It provides administrators with tools to review reports, manage their status and maintain a history of status changes.

### 1.2 Scope

The system is organized around two major concepts:

**CivicCare**
- Reporting potholes.
- Reporting garbage and sanitation issues.
- Reporting broken streetlights.
- Reporting water leakage.
- Tracking civic complaints.

**ReliefConnect**
- Recording emergency-related incidents.
- Supporting future disaster response coordination.
- Planned volunteer, shelter and resource management.

Emergency reporting is available in the current application. Automatic emergency dispatch and disaster coordination are not currently integrated.

### 1.3 Intended Users

- Citizens
- Administrators

Future intended users:
- Volunteers
- Relief coordinators

## 2. Overall Description

### 2.1 Product Perspective

CivicRelief follows a client-server architecture.

The frontend is developed using React and Vite. The backend uses Python and FastAPI. PostgreSQL stores application data, with SQLAlchemy providing database access.

### 2.2 User Characteristics

**Citizens:** Register, log in, submit civic or emergency reports and track their reports.

**Administrators:** Log in to the administrative dashboard, review submitted reports, update report statuses and maintain status-change remarks.

### 2.3 System Architecture

The application consists of:

1. Presentation Layer - React frontend.
2. Application Layer - FastAPI REST API.
3. Data Access Layer - SQLAlchemy ORM.
4. Database Layer - PostgreSQL.

## 3. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow citizens to register an account. |
| FR-02 | The system shall authenticate registered citizens. |
| FR-03 | The system shall provide administrator authentication. |
| FR-04 | The system shall allow citizens to submit civic and emergency reports. |
| FR-05 | The system shall validate report information. |
| FR-06 | The system shall store reports in PostgreSQL. |
| FR-07 | The system shall allow citizens to view their submitted reports. |
| FR-08 | The system shall allow citizens to track individual report status. |
| FR-09 | The system shall allow administrators to view submitted reports. |
| FR-10 | The system shall allow administrators to update report statuses. |
| FR-11 | The system shall maintain report status history. |
| FR-12 | The system shall record remarks for administrative status changes. |
| FR-13 | The system shall restrict citizens to accessing their own reports and report history. |
| FR-14 | The system shall provide administrative report statistics. |

## 4. Non-Functional Requirements

**NFR-01: Usability**

The interface should be simple and understandable for citizens and administrators.

**NFR-02: Security**

The system shall use password hashing, authentication and role-based access control.

**NFR-03: Reliability**

Reports and status history shall be stored persistently in PostgreSQL.

**NFR-04: Maintainability**

The application shall use modular frontend and backend components.

**NFR-05: Performance**

The application should process report operations within acceptable response times.

**NFR-06: Scalability**

The architecture should support future increases in users and report volume.

## 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Password Hashing | Argon2 |
| Testing | Pytest |
| Version Control | Git + GitHub |
| CI | GitHub Actions |

## 6. System Constraints and Limitations

- Internet connectivity is required for remote access and deployment.
- Emergency dispatch services are not integrated.
- Volunteer coordination is not implemented.
- Shelter and resource management are not implemented.
- Image uploads and external map integrations are not currently implemented.
- Production deployment is not yet configured.

## 7. Future Enhancements

- Volunteer registration and coordination.
- Task assignment and progress tracking.
- Shelter and resource management.
- Emergency notifications and external service integrations.
- Image attachments for reports.
- Map-based location visualization.
- Telugu and English language support.
- Production deployment and monitoring.

## 8. Conclusion

CivicRelief provides an integrated platform for civic and emergency-related reporting. The current implementation supports citizen authentication, report submission, administrative report management, status tracking and status history.

The modular architecture and automated CI pipeline provide a foundation for future enhancements in disaster response and civic service management.