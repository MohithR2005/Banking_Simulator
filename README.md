# Banking Transaction Simulator

A Spring Boot resume project that simulates core banking workflows: JWT authentication, account creation, deposits, withdrawals, transfers, fraud flagging, and audit logging.

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- H2 for local quick start
- PostgreSQL and Redis via Docker Compose

## Run Locally

```bash
mvn spring-boot:run
```

The app starts with an in-memory H2 database by default.

## React Frontend

The React + TypeScript + Tailwind frontend lives in `frontend/`. Its production
build is written directly to Spring Boot's static resources folder.

```bash
cd frontend
npm install
npm run dev
```

The development server runs at `http://localhost:5173` and proxies `/api`
requests to Spring Boot on port `8080`.

Build the main website served by Spring Boot with:

```bash
cd frontend
npm run build
```

## Run With PostgreSQL and Redis

```bash
docker compose up -d
```

Then start the app with:

```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-DDB_URL=jdbc:postgresql://localhost:5432/banking_simulator -DDB_USERNAME=banking_user -DDB_PASSWORD=banking_password -DDB_DRIVER=org.postgresql.Driver"
```

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/accounts`
- `GET /api/accounts`
- `POST /api/beneficiaries/lookup`
- `POST /api/beneficiaries`
- `GET /api/beneficiaries`
- `DELETE /api/beneficiaries/{id}`
- `POST /api/transactions/deposit`
- `POST /api/transactions/withdraw`
- `POST /api/transactions/transfer`
- `POST /api/transactions/beneficiary-transfer`
- `GET /api/transactions/account/{accountId}`
- `GET /api/admin/fraud-flags`
- `GET /api/admin/audit-logs`

## Demo Flow

1. Register a user.
2. Log in and copy the JWT.
3. Create one or more accounts.
4. Deposit funds.
5. Register another user and create an account for them.
6. Add that other user's account number as a beneficiary.
7. Transfer to the saved beneficiary.
8. Try a large transfer to trigger fraud detection.
