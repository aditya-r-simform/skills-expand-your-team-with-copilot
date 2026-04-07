# Mergington High School - NestJS Backend

A NestJS backend for the Mergington High School Management System. Built with:
- **NestJS** – Progressive Node.js framework with module/controller/service/repository architecture
- **Prisma** – Next-generation ORM for database access
- **SQLite** – Default database (easily swappable to PostgreSQL)
- **Argon2** – Secure password hashing
- **class-validator** – DTO validation

## Project Structure

```
nestjs-backend/
├── prisma/
│   ├── schema.prisma       # Prisma schema (Activity, Participant, Teacher models)
│   └── seed.ts             # Initial database seed with sample data
├── src/
│   ├── activities/
│   │   ├── dto/
│   │   │   ├── create-activity.dto.ts
│   │   │   └── signup-activity.dto.ts
│   │   ├── activities.controller.ts
│   │   ├── activities.module.ts
│   │   ├── activities.repository.ts
│   │   └── activities.service.ts
│   ├── auth/
│   │   ├── dto/
│   │   │   └── login.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.repository.ts
│   │   └── auth.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` to set your `DATABASE_URL`. For local development with SQLite:
```
DATABASE_URL="file:./dev.db"
```

### 3. Set up the database (generate client, run migrations, seed data)

```bash
npm run db:setup
```

Or run each step individually:

```bash
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

## Running the App

```bash
# Development (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`.

## Package.json Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start with hot reload (development) |
| `npm run start:debug` | Start with debugging enabled |
| `npm run start:prod` | Start the production build |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint and auto-fix code |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations (dev) |
| `npm run prisma:migrate:prod` | Deploy migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio UI |
| `npm run prisma:seed` | Seed the database with initial data |
| `npm run db:setup` | Full setup: generate + migrate + seed |

## API Endpoints

### Activities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/activities` | Get all activities (supports `?day=`, `?start_time=`, `?end_time=` filters) |
| GET | `/activities/days` | Get list of all days that have activities |
| POST | `/activities` | Create a new activity |
| POST | `/activities/:name/signup` | Sign up a student (body: `{ email, teacherUsername }`) |
| POST | `/activities/:name/unregister` | Unregister a student (body: `{ email, teacherUsername }`) |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login with username and password |
| GET | `/auth/check-session` | Verify a session (`?username=`) |
