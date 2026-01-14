Absolutely! Here's a **single, copy-paste-ready README.md** that includes the `.env` step and all development instructions:

````markdown
# 🌍 International Dummy Money Order System

This project is a **development-only** implementation of an International Dummy Money Order System using **NestJS** and **Temporal**.

> ⚠️ **Production setup is intentionally not included** in this README.

---

## 🧰 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Temporal CLI**
- **Git**

---

## 📦 Install Dependencies

```bash
npm install
````

---

## 🌿 Environment Setup

Copy the example environment file:

```bash
cp .example.env .env
```

> This sets up all required environment variables for development.

---

## ⏱️ Temporal Setup (Dev Only)

### 1️⃣ Create Temporal Namespace

```bash
temporal operator namespace create money-order
```

> This namespace is required for workflows and workers to operate.

---

### 2️⃣ Start Temporal Dev Server

```bash
temporal server start-dev --db-filename ~/temporal-db/temporal.db
```

* Runs Temporal locally
* Persists data in a local SQLite DB
* Starts Temporal Web UI automatically

Temporal Web UI (default):

```
http://localhost:8233
```

---

## 🌱 Seed Initial Data (Admin)

Run this **once** after installing dependencies:

```bash
npm run seed:admin
```

This seeds:

* Initial admin user(s)
* Required base system data for development

---

## 🚀 Running the Application (Development)

You need **two processes running in parallel**:

---

### 1️⃣ Start NestJS API Server (Dev)

```bash
npm run start:dev
```

* Runs NestJS with hot reload
* API available at:

```
http://localhost:3000
```

---

### 2️⃣ Start Temporal Worker (Dev)

Open a **new terminal** and run:

```bash
npm run worker:dev
```

* Starts Temporal worker
* Watches workflow & activity code
* Required for workflow execution

---

## 📜 Available Scripts (Dev Focused)

```json
{
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "worker:dev": "nodemon -r tsconfig-paths/register src/modules/infrastructure/temporal/worker/worker.ts",
  "start:debug": "nest start --debug --watch",
  "seed:admin": "node -r ts-node/register -r tsconfig-paths/register src/modules/seed/admin/admin.seed.ts"
}
```

> ❌ `start:prod`, `worker:prod`, and prod seed scripts are intentionally **not covered**.

---

## ✅ Development Flow Summary

1. Install dependencies
2. Copy `.example.env` to `.env`
3. Create Temporal namespace
4. Start Temporal dev server
5. Seed admin data
6. Run NestJS API
7. Run Temporal worker

**All 7 steps are required for full functionality.**

---

## 🧪 Notes

* This system is **dummy / non-financial**
* Intended for **local development & testing**
* No real money movement occurs
