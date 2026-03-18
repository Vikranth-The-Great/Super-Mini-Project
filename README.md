# Food Waste Management System (MERN)

A modern full-stack web application for managing food donations and waste reduction.

## Stack

- MongoDB
- Express.js
- React.js (Vite)
- Node.js

## Project Structure

- `server/` - Express API, MongoDB models, JWT auth, role-based routes
- `client/` - React frontend for User, Admin, and Delivery roles

## Setup

1. Install dependencies:
   - `cd mern`
   - `npm install`
   - `npm run install:all`

2. Configure backend env:
   - Copy `server/.env.example` to `server/.env`
   - Update values if required

3. Start MongoDB locally (default URI in env expects `mongodb://127.0.0.1:27017/food_waste_management`).

4. Run app (frontend + backend):
   - `npm run dev`

5. Open client:
   - `http://localhost:5173`

## API Highlights

- User auth: `/api/auth/*`
- Admin auth: `/api/admin/auth/*`
- Delivery auth: `/api/delivery/auth/*`
- Donations: `/api/donations/*`
- Feedback: `/api/feedback/*`
- Analytics: `/api/analytics`

## Features

- User authentication and profile management
- Food donation listing and tracking
- Admin dashboard with analytics
- Delivery person management and order tracking
- Real-time notifications
- Multi-language support (English, Hindi, Kannada)
- Role-based access control (User, Admin, Delivery)

