# Food Waste Management System - Full Guide

This repository now contains:
- server/ (Express API + MongoDB)
- client/ (React web app)
- packages/shared/ (shared constants/types/utils)

## Run Locally

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Start MongoDB.

3. Start web + server:

```bash
npm run dev
```

4. Build web app:

```bash
npm run build:web
```

5. Run server tests:

```bash
npm run test:server
```

## Environment

Server variables are documented in:
- server/.env.example
- apps/server/.env.example

## Notes

- The codebase is web + backend focused.
- Shared utilities are located in packages/shared.
