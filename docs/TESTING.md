# CivicRelief – Software Testing Documentation

## 1. Introduction

Software testing is performed to verify that the CivicRelief application functions correctly and meets its requirements.

The backend is tested using the Pytest framework, while the frontend is validated through its production build process.

## 2. Testing Environment

| Component | Technology |
|---|---|
| Backend | Python, FastAPI |
| Database | PostgreSQL 16 |
| Testing Framework | Pytest |
| Frontend | React, Vite |
| Runtime | Node.js |
| CI Platform | GitHub Actions |

## 3. Backend Test Cases

The project currently contains six automated backend tests.

| Test ID | Test Case | Expected Result |
|---|---|---|
| TC-01 | Create and retrieve a report | Report is created and retrieved successfully |
| TC-02 | Submit an invalid report category | Request is rejected with validation error |
| TC-03 | Access report endpoints without authentication | Unauthorized access is rejected |
| TC-04 | Create a report and verify initial history | Initial Submitted history entry is created |
| TC-05 | Admin updates report status with remarks | Status and history are updated successfully |
| TC-06 | Citizen accesses another citizen's history | Access is denied |

## 4. Testing Approach

### 4.1 Functional Testing

Verifies report creation, retrieval, authentication, authorization and status updates.

### 4.2 Authentication Testing

Checks whether protected endpoints reject requests without valid authentication.

### 4.3 Authorization Testing

Verifies that citizens can access only their own reports and report history, while administrative operations require an administrator account.

### 4.4 Database Testing

Verifies that reports and their status history are persisted correctly in PostgreSQL.

### 4.5 Continuous Integration Testing

GitHub Actions automatically executes backend tests and verifies the frontend production build after pushes to the main branch and pull requests targeting main.

## 5. Test Execution

Backend test command:

`python -m pytest -v`

Frontend build command:

`npm run build`

The latest verified backend test execution completed with:

**6 passed, 1 warning**

The GitHub Actions CI run also completed successfully:

| CI Job | Result |
|---|---|
| Backend Tests | Success |
| Frontend Production Build | Success |
| Overall CI Pipeline | Success |

## 6. Conclusion

The automated testing process validates important CivicRelief functionality, including report management, authentication, authorization and report status history.

The integration of Pytest and GitHub Actions helps identify defects early and improves the reliability of the application.