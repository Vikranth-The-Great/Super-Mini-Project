# Food Waste Management System

## Project Overview

Food Waste Management System is now a browser-only web application for coordinating food donations between donors, NGO/admin users, and delivery partners.

The current runtime is centered on the React + Vite client and a structured localStorage-backed browser store.

Historical backend and shared-package notes remain below for migration context only.

## Project Goals

The application is designed to support the full food donation lifecycle:

- Donors register, sign in, and post surplus food.
- NGOs discover nearby, active donations and claim them.
- Delivery partners accept assigned orders and mark them as delivered.
- All parties receive status updates and notifications.
- Admin/NGO users can review analytics, donation tracking, and feedback.
- Public users can explore the platform pages and search for food availability.

## Current Architecture

### Stack

- Frontend: React 19, React Router, Vite, i18next, Chart.js, Leaflet.
- Storage: Browser localStorage with structured JSON state.
- Testing: Browser and UI validation only.

### Runtime Pattern

- The browser reads and writes directly to the local data store.
- Authentication is session-like and persisted in browser storage.
- Notifications, donation history, and analytics are derived from the stored JSON state.
- The UI refreshes state from the browser store after actions and reloads.

## Core User Roles

### Donor

The donor is the person or household posting excess food. The donor can:

- Register and sign in.
- Create donations with food details, phone number, location, address, and expiry information.
- View their donation history and status updates.
- Receive notifications when their donation is claimed, picked up, or delivered.

### NGO / Admin

The NGO role acts as the receiver and coordinator. The NGO can:

- Register and sign in.
- View available donations.
- Claim a donation.
- Track assigned donations.
- Inspect analytics and feedback.
- Review notifications.

### Delivery Partner

The delivery role handles pickup and drop-off. The delivery partner can:

- Register and sign in.
- View assigned deliveries.
- Accept an assigned order.
- Mark the order as placed/delivered.
- Review notifications.

## Web Application Structure

### Client Entry Points

- `client/src/main.jsx` mounts the app.
- `client/src/App.jsx` defines routing and protected route behavior.
- `client/src/context/AuthContext.jsx` manages login state, tokens, and role aliases.

### Public Pages

- `client/src/pages/IndexPage.jsx` provides the landing entry point.
- `client/src/pages/HomePage.jsx` provides the main public/home experience.
- `client/src/pages/AboutPage.jsx` and `client/src/pages/AboutProject.jsx` describe the platform.
- `client/src/pages/ContactPage.jsx` provides contact information.
- `client/src/pages/FindFood.jsx` allows food discovery.

### Donor Pages

- `client/src/pages/user/UserLogin.jsx` handles donor sign in.
- `client/src/pages/user/UserSignup.jsx` handles donor sign up.
- `client/src/pages/user/DonateForm.jsx` handles food submission.
- `client/src/pages/user/UserProfile.jsx` shows donation status and notifications.
- `client/src/pages/user/DeliveryConfirm.jsx` shows post-donation confirmation.

### NGO Pages

- `client/src/pages/admin/AdminLogin.jsx` handles NGO sign in.
- `client/src/pages/admin/AdminSignup.jsx` handles NGO sign up.
- `client/src/pages/admin/AdminDashboard.jsx` shows available donations and claim actions.
- `client/src/pages/admin/AdminProfile.jsx` shows NGO tracking.
- `client/src/pages/admin/Analytics.jsx` shows dashboard metrics.
- `client/src/pages/admin/DonatePage.jsx` supports location-based donation search.
- `client/src/pages/admin/AdminFeedback.jsx` shows feedback.
- `client/src/pages/admin/AdminNotifications.jsx` shows NGO notifications.

### Delivery Pages

- `client/src/pages/delivery/DeliveryLogin.jsx` handles delivery sign in.
- `client/src/pages/delivery/DeliverySignup.jsx` handles delivery sign up.
- `client/src/pages/delivery/DeliveryDashboard.jsx` shows available and assigned pickup work.
- `client/src/pages/delivery/MyOrders.jsx` lists the delivery partner’s orders.
- `client/src/pages/delivery/OpenMap.jsx` provides map-oriented viewing.
- `client/src/pages/delivery/DeliveryNotifications.jsx` shows delivery notifications.

### Shared Client Components

- `client/src/components/Navbar.jsx` provides global navigation.
- `client/src/components/Footer.jsx` provides footer content.
- `client/src/components/LocationAssistant.jsx` supports location selection and geocoding.
- `client/src/components/RealTimeNotificationPanel.jsx` manages live notification visibility.
- `client/src/components/RecommendedNgoCard.jsx` shows NGO recommendations.
- `client/src/components/LanguageSwitcher.jsx` handles language selection.
- `client/src/components/Chatbot.jsx` provides an assistance widget.
- `client/src/components/AdminSidebar.jsx` and `client/src/components/DeliverySidebar.jsx` provide role-specific navigation.

## Backend Structure

### Server Entry Points

- `server/index.js` starts the application server.
- `server/app.js` configures middleware and route registration.
- `server/socket.js` configures Socket.IO and authenticated realtime events.

### API Route Modules

- `server/routes/auth.js` handles donor registration, login, and profile access.
- `server/routes/adminAuth.js` handles NGO registration, login, and profile access.
- `server/routes/deliveryAuth.js` handles delivery registration, login, and profile access.
- `server/routes/donations.js` handles donation creation and lifecycle actions.
- `server/routes/ngos.js` handles NGO helper views and listing endpoints.
- `server/routes/feedback.js` handles feedback submission and retrieval.
- `server/routes/analytics.js` handles dashboard statistics.
- `server/routes/notifications.js` handles notification listing and read updates.

### Middleware and Utilities

- `server/middleware/auth.js` protects routes using JWT verification.
- `server/utils/jwt.js` signs and verifies tokens with a local HMAC-based implementation.
- `server/config/db.js` manages the MongoDB connection.

## Data Models

### User Model

File: `server/models/User.js`

Fields:

- `name`
- `email`
- `password`
- `gender`
- `phoneno`
- `location`

Rules:

- `name` is required and must be at least 3 characters.
- `email` is required, unique, lowercase, and trimmed.
- `password` is required and must be at least 6 characters.
- `gender` must be one of `male`, `female`, or `other`.
- `phoneno` must be exactly 10 digits.
- `location` is required.

### Admin Model

File: `server/models/Admin.js`

Fields:

- `name`
- `email`
- `password`
- `phoneno`
- `address`
- `location`

Rules:

- `phoneno` must be exactly 10 digits.
- `address` is required and must be descriptive enough for location reasoning.

### DeliveryPerson Model

File: `server/models/DeliveryPerson.js`

Fields:

- `name`
- `email`
- `password`
- `phoneno`
- `city`

Rules:

- `phoneno` must be exactly 10 digits.
- `city` is required.

### FoodDonation Model

File: `server/models/FoodDonation.js`

Fields include:

- donor identity and contact data.
- food description and category.
- quantity.
- location and address.
- latitude and longitude.
- expiry date and expiry time.
- claim and delivery fields.
- status.

Important status values:

- `Posted`
- `Assigned`
- `In Transit`
- `Delivered`
- `Completed`

### Notification Model

File: `server/models/Notification.js`

Notifications are stored per recipient role and recipient id, and are used for claims, deliveries, and status updates.

### Feedback Model

File: `server/models/Feedback.js`

Feedback supports user messages and admin review flows.

## Historical Shared Package

The shared package was used to prevent duplication when the repository still had a backend.

### Constants

- `packages/shared/src/constants/apiRoutes.ts` defines all route paths.
- `packages/shared/src/constants/roles.ts` defines the role names.
- `packages/shared/src/constants/donationStatus.ts` defines status labels and color mapping.
- `packages/shared/src/constants/fieldNames.ts` centralizes field labels.
- `packages/shared/src/constants/errors.ts` centralizes user-facing validation messages.

### Utilities

- `packages/shared/src/utils/validation.ts` provides form validation helpers.
- `packages/shared/src/utils/formatters.ts` provides display formatting helpers.
- `packages/shared/src/utils/errorParsing.ts` normalizes API error shapes.

### Types

- `packages/shared/src/types/auth.ts` describes auth payloads and responses.
- `packages/shared/src/types/donation.ts` describes donation data structures.
- `packages/shared/src/types/notification.ts` describes notification payloads.

## Historical API Surface

### Authentication Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/admin/auth/register`
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/delivery/auth/register`
- `POST /api/delivery/auth/login`
- `GET /api/delivery/auth/me`

### Donation Endpoints

- `POST /api/donations`
- `GET /api/donations/my`
- `GET /api/donations/all`
- `GET /api/donations/available`
- `POST /api/donations/:id/claim`
- `PUT /api/donations/:id/assign`
- `PUT /api/donations/:id/take`
- `PUT /api/donations/:id/place`
- `POST /api/donations/:id/cancel`

### NGO Endpoints

- `GET /api/ngos/food-availability`
- `GET /api/ngos/list`
- `GET /api/ngos/available-for/:id`

### Notification Endpoints

- `GET /api/notifications/my`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### Analytics Endpoints

- `GET /api/analytics`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/food-stats`

### Feedback Endpoints

- `POST /api/feedback`
- `GET /api/feedback/list`

### Health Endpoint

- `GET /api/health`

## Donation Lifecycle

The donation flow is the heart of the application.

### Lifecycle Stages

1. Donor posts food.
2. Donation appears as `Posted`.
3. NGO claims the donation.
4. Donation becomes `Assigned`.
5. Delivery partner accepts it.
6. Donation becomes `In Transit`.
7. Delivery partner marks it as delivered.
8. Donation becomes `Delivered`.
9. Final completion is recorded as `Completed` where applicable.

### Browser Enforcement

The browser store validates:

- Required fields.
- Phone number format.
- Numeric and positive quantity.
- Expiry time not being in the past.
- Coordinate bounds.
- No duplicate submissions within the guarded window.
- Claim actions only on active donations.
- Delivery actions only on the correct status.
- Double-claim prevention.

### Client Enforcement

The client validates:

- Required form fields.
- Email and password input formats.
- Phone number length.
- Location selection.
- Button disabling while requests are active.
- Visible error messages on API failure.

## Validation Rules

### Registration Validation

The application uses consistent validation across all roles:

- Name must be present and sufficiently long.
- Email must use a valid format.
- Password must be at least 6 characters.
- Phone number must be exactly 10 digits.
- Role-specific location or address must be provided.
- Donor gender must be selected.

### Donation Validation

Donation submission requires:

- Food name.
- Food type.
- Food category.
- Quantity.
- Phone number.
- Location.
- Address.
- Expiry date.
- Expiry time.
- Valid coordinates when supplied.

### Quantity Rules

- Quantity must be numeric.
- Quantity must be greater than zero.
- Negative or empty quantities are rejected.

### Location Rules

- Coordinates must stay within valid latitude and longitude bounds.
- Location strings are trimmed.
- Location-based search is supported on the NGO side.

### Expiry Rules

- Food cannot be posted with a past expiry time.
- Expired donations should not be claimable.
- Expiry is enforced on both the client and the server.

## Client Features

### Public Experience

- Landing and informational pages.
- Food search and discovery.
- Language switching.
- Contact and project information pages.

### Donor Experience

- Sign up and sign in.
- Donation form with validation.
- Donation history.
- Status display.
- Notification review.

### NGO Experience

- Sign up and sign in.
- Available donation dashboard.
- Donation claim workflow.
- Tracking and analytics.
- Donation search by location.
- Notification review.

### Delivery Experience

- Sign up and sign in.
- Available pickup dashboard.
- My orders page.
- Pickup acceptance.
- Delivery completion.
- Notification review.

### Realtime and Refresh Behavior

- Notification panel updates live.
- Key dashboards poll at intervals to reduce stale UI.
- Buttons show loading states while actions are in progress.
- Errors are surfaced instead of failing silently.

## Historical Backend Features

### Authentication

- JWT-based role authentication.
- Donor, NGO, and delivery login flows.
- Protected routes for role-sensitive actions.

### Donation Management

- Donation creation.
- Claim assignment.
- Delivery handoff.
- Delivery completion.
- Lifecycle state transitions.

### Notifications

- Notification creation on key events.
- Notification retrieval by recipient.
- Mark single or all notifications as read.

### Analytics

- Donation and order counts.
- Delivered order statistics.
- Pending or active order counts.
- Food saved and environmental impact metrics.

### Search and Discovery

- NGO food availability endpoints.
- Location-based donor-to-ngo matching.
- Recommended NGO ranking.

## Implementation Methodology

The implementation work in this repository followed a safety-first, checklist-driven process.

### Methodology Used

- Inspect the repo structure before editing.
- Trace the data flow from UI to API to database.
- Identify validation gaps at both client and server layers.
- Add guardrails where silent failures could occur.
- Keep role-specific flows consistent.
- Re-run build and tests after each meaningful change.
- Remove deprecated mobile code after confirming web parity.

### Design Principles

- Prefer local store enforcement for critical rules.
- Mirror store constraints in the client UI.
- Avoid silent failures.
- Make status text match actual stored state.
- Keep route aliases when needed for backward compatibility.
- Use shared constants and helpers instead of duplicating strings and rules.

### Hardening Work Completed

- Added stronger field validation for signup forms.
- Added phone validation to all role registrations.
- Added location capture for donor signup.
- Added visible error handling on dashboards and searches.
- Added polling to keep listings current.
- Added flow guards for delivery actions.
- Aligned donor-facing status labels with the server lifecycle.

## Testing Strategy

### Automated Tests

The browser-only version uses client-side checks and manual validation of stored state.

Important test coverage includes:

- Donation lifecycle behavior.
- Role authorization checks.
- Analytics dashboard behavior.

### Manual Validation

The repository was verified with:

- `npm run build:web`
- `npm run test:server`

### Error Checks

Edited client files were checked for compile or lint issues after changes, and the build/test pipeline remained green.

## Scripts

Root scripts currently supported:

- `npm run install:all`
- `npm run dev`
- `npm run dev:web`
- `npm run dev:server`
- `npm run dev:all`
- `npm run build:web`
- `npm run test:server`
- `npm run test`

## Environment Setup

### Development Assumptions

- The frontend runs on port 5173 by default.
- Browser storage is available for persistence.
- No server process is required for runtime.

## Important Constraints

- The repository is frontend-only.
- Mobile-specific code, scripts, and references were removed.
- Phone number validation is enforced as exactly 10 digits where used.
- Food expiry cannot be bypassed.
- Only one NGO can claim a donation at a time.
- Delivery actions must follow the valid order flow.
- Notifications and dashboards should not fail silently.

## Current Known Status

- The web build is passing.
- The browser-only architecture is the current target.
- The mobile implementation is removed.
- The codebase is aligned with the current checklist expectations.

## Files That Matter Most

### Root

- `README.md`
- `README_FULL.md`
- `CHECKLIST.md`
- `package.json`

### Client

- `client/src/App.jsx`
- `client/src/context/AuthContext.jsx`
- `client/src/pages/user/DonateForm.jsx`
- `client/src/pages/user/UserSignup.jsx`
- `client/src/pages/user/UserProfile.jsx`
- `client/src/pages/admin/AdminDashboard.jsx`
- `client/src/pages/admin/Analytics.jsx`
- `client/src/pages/admin/DonatePage.jsx`
- `client/src/pages/admin/AdminNotifications.jsx`
- `client/src/pages/delivery/DeliveryDashboard.jsx`
- `client/src/pages/delivery/MyOrders.jsx`
- `client/src/pages/delivery/DeliveryNotifications.jsx`
- `client/src/components/LocationAssistant.jsx`
- `client/src/components/RealTimeNotificationPanel.jsx`

### Server

- `server/app.js`
- `server/socket.js`
- `server/routes/auth.js`
- `server/routes/adminAuth.js`
- `server/routes/deliveryAuth.js`
- `server/routes/donations.js`
- `server/routes/notifications.js`
- `server/routes/analytics.js`
- `server/models/User.js`
- `server/models/Admin.js`
- `server/models/DeliveryPerson.js`
- `server/models/FoodDonation.js`
- `server/utils/jwt.js`

### Shared Package

- `packages/shared/src/constants/apiRoutes.ts`
- `packages/shared/src/constants/donationStatus.ts`
- `packages/shared/src/utils/validation.ts`
- `packages/shared/src/types/auth.ts`
- `packages/shared/src/types/donation.ts`

## Summary

This project is a role-based food donation platform with a validated web UI, enforced backend lifecycle rules, realtime notifications, shared contracts, and analytics support. The codebase currently focuses on a production-ready web experience backed by a Node.js API and MongoDB data model.