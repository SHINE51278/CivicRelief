
# CivicRelief - Continuous Integration and Continuous Deployment (CI/CD)

## 1. Introduction

CivicRelief uses Git and GitHub for version control and GitHub Actions for Continuous Integration (CI).

The CI pipeline automatically validates the backend and frontend whenever code is pushed to the main branch or a pull request is created.

## 2. Tools and Technologies

- Git: Version control
- GitHub: Remote repository and collaboration
- GitHub Actions: CI automation
- Python 3.12: Backend environment
- FastAPI: Backend framework
- PostgreSQL 16: Database service for automated tests
- Pytest: Backend testing framework
- Node.js 22: Frontend build environment
- React and Vite: Frontend technologies
- npm: Dependency management

## 3. CI Pipeline Architecture

The workflow is defined in:

`.github/workflows/ci.yml`

The pipeline contains two independent jobs.

### Job 1: Backend Tests

1. Checks out the source code.
2. Sets up Python 3.12.
3. Starts a PostgreSQL 16 service.
4. Installs dependencies from requirements.txt.
5. Executes automated tests using pytest.

Command:

`python -m pytest -v`

### Job 2: Frontend Production Build

1. Checks out the source code.
2. Sets up Node.js 22.
3. Installs dependencies using npm ci.
4. Generates the production build using Vite.

Command:

`npm run build`

## 4. Workflow Triggers

The CI pipeline executes automatically when:

- Code is pushed to the main branch.
- A pull request targeting the main branch is created.

## 5. Testing and Verification

The initial backend test suite contains six automated tests.

The GitHub Actions workflow was successfully executed.

Verified results:

| Component | Result |
|---|---|
| Backend Tests | Success |
| Frontend Production Build | Success |
| Overall CI Pipeline | Success |
| Total workflow duration | 46 seconds |

## 6. Benefits of CI

- Detects errors early in development.
- Automates backend testing.
- Verifies frontend production builds.
- Reduces manual testing effort.
- Improves software quality.
- Supports safer collaborative development.

## 7. Current Limitations and Future Enhancements

The current implementation provides Continuous Integration.

The following features are planned future enhancements:

- Continuous Deployment to a hosting platform.
- Automated code quality and security scanning.
- Test coverage reporting.
- Pull request quality checks.
- Production monitoring and logging.

## 8. Conclusion

CivicRelief successfully implements an automated Continuous Integration pipeline using GitHub Actions.

Both backend tests and frontend production builds completed successfully, demonstrating that the project can automatically validate important parts of the application whenever changes are pushed to GitHub.
