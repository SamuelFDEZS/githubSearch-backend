# GitHub Search Backend

Backend service for a GitHub discovery application focused on searching users and repositories, applying repository filters, and managing application users.

The API acts as an intermediate layer between the frontend, the GitHub REST API and PostgreSQL. Besides keeping the GitHub token away from the client, it centralizes search logic, authentication, validation and persistence.

**Stack:** Node.js · Express · PostgreSQL · JWT · bcrypt · Jest · Supertest · Docker · GitHub Actions · Vercel

---

## Overview

GitHub Search Backend has two main responsibilities:

* Provide a server-side gateway to the GitHub REST API for user and repository discovery.
* Provide an authentication and account-management API backed by PostgreSQL.

Repository searches support multiple GitHub qualifiers such as language, stars, forks, update date, topic and license. User accounts support registration, login, profile updates, password changes and account deletion.

The project also includes automated tests, a reproducible Docker development environment and a CI/CD pipeline that validates changes before deployment.

---

## Architecture

```mermaid
flowchart LR
    Client[Frontend] -->|HTTP requests| API[Express API]

    API -->|Authenticated requests| GitHub[GitHub REST API]
    API -->|SQL queries| DB[(PostgreSQL)]

    Actions[GitHub Actions] -->|CI| Tests[Tests + Coverage + Docker Build]
    Tests -->|Success on main| Deploy[CD]
    Deploy --> Vercel[Vercel]
```

The application is split into routes, controllers, middlewares, database configuration and utilities instead of keeping the API logic in a single file.

```text
src/
├── controllers/
│   ├── github.controllers.cjs
│   └── user.controllers.cjs
├── db/
│   └── db.cjs
├── middlewares/
│   ├── auth.middleware.cjs
│   ├── validateLogin.middleware.cjs
│   ├── validateModifyPass.middleware.cjs
│   └── validateUser.middleware.cjs
├── routes/
│   ├── github.routes.cjs
│   └── users.routes.cjs
├── utils/
│   └── buildRepositoryParams.js
└── app.cjs
```

---

## Main features

### GitHub API integration

The backend communicates with the GitHub REST API using a server-side token, preventing the token from being exposed in frontend code.

It provides endpoints for:

* GitHub user search.
* User profile information and summaries.
* Repository retrieval by user.
* Repository search.
* Individual repository details.
* User activity and subscription information.
* Pagination metadata through GitHub's `Link` header.

### Advanced repository search

Repository queries are built dynamically from the filters received by the API.

Supported filters include:

| Parameter  | Purpose                                                    |
| ---------- | ---------------------------------------------------------- |
| `search`   | Free-text repository search                                |
| `language` | Programming language                                       |
| `stars`    | Stars qualifier or range                                   |
| `forks`    | Forks qualifier or range                                   |
| `date`     | Exact date or repositories updated within a number of days |
| `topic`    | GitHub topic                                               |
| `license`  | Repository license                                         |
| `sort`     | `stars`, `forks` or `updated`                              |
| `order`    | `asc` or `desc`                                            |
| `page`     | Result page                                                |
| `perPage`  | Results per page                                           |

Numeric qualifiers support values such as:

```text
100
100..500
>=100
>100
<=100
<100
```

Search parameters are normalized and validated before being forwarded to GitHub.

---

## Authentication and user management

The backend includes its own account system backed by PostgreSQL.

Passwords are never stored directly. They are hashed with `bcrypt` before being persisted.

After a successful login, the API creates a JWT:

* Signed with `HS256`.
* Contains the user ID in the `sub` claim.
* Expires after one hour.

Protected routes expect:

```http
Authorization: Bearer <token>
```

The authentication middleware verifies the signature, validates the user identifier and exposes the authenticated user to the following request handlers.

Account operations use parameterized PostgreSQL queries to keep user-controlled values separate from SQL statements.

---

## API

### Health

| Method | Endpoint  | Description            |
| ------ | --------- | ---------------------- |
| `GET`  | `/health` | Check API availability |

### GitHub

| Method | Endpoint                              | Description                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| `GET`  | `/api/user?username=`                 | Get a GitHub user                         |
| `GET`  | `/api/user/summary?username=`         | Get a reduced profile summary             |
| `GET`  | `/api/user/repos?username=`           | Get repository information for a user     |
| `GET`  | `/api/search-users?q=`                | Search GitHub users                       |
| `GET`  | `/api/user-repos?user=`               | Get repositories owned by a user          |
| `GET`  | `/api/search-repos`                   | Search repositories with optional filters |
| `GET`  | `/api/repo?owner=&repo=`              | Get a single repository                   |
| `GET`  | `/api/user/received-events?username=` | Get user activity information             |
| `GET`  | `/api/user/subscriptions?username=`   | Get user subscription information         |

### Accounts

| Method   | Endpoint            | Authentication | Description                      |
| -------- | ------------------- | -------------- | -------------------------------- |
| `POST`   | `/user/register`    | No             | Create an account                |
| `POST`   | `/user/login`       | No             | Authenticate and receive a JWT   |
| `GET`    | `/user/me`          | Bearer token   | Get the authenticated profile    |
| `PATCH`  | `/user/me`          | Bearer token   | Update username, email or phone  |
| `PATCH`  | `/user/me/password` | Bearer token   | Change password                  |
| `DELETE` | `/user/me`          | Bearer token   | Delete the authenticated account |

---

## Database

The application uses PostgreSQL.

The `users` table stores:

| Column          | Type           | Notes                             |
| --------------- | -------------- | --------------------------------- |
| `id`            | `SERIAL`       | Primary key                       |
| `username`      | `VARCHAR(50)`  | Required and unique               |
| `email`         | `VARCHAR(100)` | Required and unique               |
| `password_hash` | `TEXT`         | bcrypt hash                       |
| `phone`         | `VARCHAR(20)`  | Optional and unique               |
| `created_at`    | `TIMESTAMPTZ`  | Defaults to the current timestamp |

The database configuration supports two environments:

**Remote / production**

```text
DATABASE_URL
```

**Local / Docker**

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

When `DATABASE_URL` is available, it takes precedence over the individual database variables.

---

## Environment variables

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
```

For a direct connection to a remote PostgreSQL database:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

Or configure the connection individually:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=github_search
```

Never commit `.env` or production credentials to the repository.

---

## Running with Docker

Docker Compose provides the easiest way to run the backend locally because Node.js and PostgreSQL are provisioned automatically.

### Requirements

* Docker Desktop or Docker Engine with Docker Compose.

Clone the repository:

```bash
git clone https://github.com/SamuelFDEZS/githubSearch-backend.git
cd githubSearch-backend
```

Create the `.env` file with at least:

```env
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
```

Start the environment:

```bash
docker compose up --build
```

Docker Compose will:

1. Build the Node.js backend image.
2. Start PostgreSQL 17.
3. Create the local `github_search` database.
4. Execute `docker/init.sql` on the first database initialization.
5. Create the `users` table.
6. Attach PostgreSQL data to a persistent Docker volume.
7. Start the backend on port `3000`.

The API will be available at:

```text
http://localhost:3000
```

You can verify it with:

```text
GET http://localhost:3000/health
```

Stopping the containers does not remove the database volume:

```bash
docker compose down
```

To also delete the local database volume and recreate the database from scratch:

```bash
docker compose down -v
```

---

## Running without Docker

### Requirements

* Node.js 22
* npm
* PostgreSQL

Install dependencies:

```bash
npm ci
```

Configure the required environment variables and start the server:

```bash
npm start
```

The local server listens on port `3000`.

The database schema required by the application is available in:

```text
docker/init.sql
```

---

## Testing

The project uses **Jest** for automated testing and **Supertest** for HTTP integration tests.

The test suite covers both middleware behavior and API routes, including:

* Authentication failures and valid JWTs.
* User input validation.
* Login validation.
* Password-change validation.
* Health endpoint behavior.
* Account registration and login.
* Protected profile operations.
* Database success and failure scenarios.
* Expected HTTP status codes and response bodies.

Run the full test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Coverage reports include statements, branches, functions and lines.

---

## CI/CD

The repository uses GitHub Actions for continuous integration and continuous deployment.

### Continuous Integration

CI runs on pushes and pull requests.

The workflow:

```text
Checkout repository
        ↓
Set up Node.js 22
        ↓
Restore npm cache
        ↓
npm ci
        ↓
Jest + coverage
        ↓
Docker image build
```

A failed test or failed Docker build causes the workflow to fail.

This allows CI to be used as a required status check before changes are merged into the protected `main` branch.

### Continuous Deployment

Production deployment is handled by a separate workflow.

When CI completes successfully on `main`, CD:

1. Checks out the exact commit validated by CI.
2. Installs the Vercel CLI.
3. Retrieves the project's production configuration.
4. Builds the Vercel deployment.
5. Deploys the prebuilt application to production.

Deployment credentials are stored as GitHub repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

A failed CI run does not trigger a production deployment.

---

## Project structure

```text
.
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── api/
│   └── index.cjs
│
├── docker/
│   └── init.sql
│
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   └── app.cjs
│
├── tests/
│   ├── integration/
│   └── middlewares/
│
├── .dockerignore
├── Dockerfile
├── compose.yaml
├── package.json
├── server.cjs
└── vercel.json
```

---

## Some design decisions

### Keep the GitHub token server-side

Requests to GitHub go through the backend instead of exposing the personal access token in browser JavaScript.

### Separate external API logic from account management

GitHub-related operations and local account operations use independent routes and controllers, which keeps both responsibilities easier to understand and maintain.

### Support local and hosted databases

The database layer can connect through a production `DATABASE_URL` or through individual connection parameters, allowing the same codebase to work with a hosted PostgreSQL service and with the PostgreSQL container used during local development.

### Reproducible development environment

Docker Compose removes the need to manually install or configure the exact Node.js and PostgreSQL versions before running the backend.

### Validate before deployment

Production deployment is kept separate from CI and only runs after the validation workflow succeeds on `main`.

---

## Possible next steps

The project is functional, but there are several improvements that would make the backend more complete:

* GitHub OAuth authentication.
* API rate limiting, especially on authentication and GitHub proxy routes.
* Stricter production CORS configuration.
* Structured application logging.
* Database migrations instead of relying only on the initial SQL script.
* Further separation into service and repository layers as the application grows.
* Expanded automated testing for the GitHub integration and repository-filter utility.

---

## Related project

The frontend is maintained in a separate repository:

```text
https://github.com/SamuelFDEZS/githubSearch
```

It consumes this API to provide the user-facing GitHub search experience.

---

## Author

**Samuel Fernández**

GitHub:

```text
https://github.com/SamuelFDEZS
```
