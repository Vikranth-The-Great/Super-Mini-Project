# Food Waste Management System - Full Guide

This repository is browser-only. All persistence, authentication, donation tracking, notifications, and analytics are handled in the client with localStorage.

## Repository Layout

- client/ - React + Vite web app

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the web app:

```bash
npm run dev
```

3. Build or preview the production bundle:

```bash
npm run build:web
npm run preview:web
```

## Architecture Notes

- No backend server is required.
- No MongoDB or environment file is required for runtime.
- App state is stored in localStorage under a structured JSON record.
- Demo seed data is created automatically if storage is empty.

## Core Flows

- Users, NGO/admin users, and delivery partners sign up and sign in locally.
- Donors create donations and see their own history and notifications.
- NGO users claim available donations and review analytics.
- Delivery partners accept assigned pickups and complete deliveries.
- Public food availability and feedback are stored in the browser.
