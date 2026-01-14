# GigFlow 🚀

A full-stack freelance marketplace platform built with the MERN stack, featuring real-time bidding, atomic transaction handling, and OAuth authentication. GigFlow demonstrates enterprise-grade backend architecture with MongoDB transactions, RabbitMQ messaging, Socket.IO real-time updates, and a modern React frontend.

![GigFlow Banner](./frontend/public/demo/Demo-1.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Real-time Features](#real-time-features)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Deployment](#deployment)

## 🎯 Overview

GigFlow is a production-ready freelance marketplace that enables:
- **Clients** to post gigs and hire freelancers
- **Freelancers** to browse gigs and submit competitive bids
- **Real-time** collaboration through WebSocket connections
- **Atomic** hiring transactions preventing race conditions
- **Multi-provider** authentication (Email, Google, GitHub)

### What Makes GigFlow Special?

✅ **Atomic Hiring Logic** - MongoDB transactions ensure data consistency when hiring  
✅ **Race Condition Protection** - Concurrent hire requests handled safely  
✅ **HttpOnly Cookie JWT** - Secure authentication immune to XSS attacks  
✅ **Real-time Updates** - Socket.IO for instant bid notifications  
✅ **Event-Driven Architecture** - RabbitMQ for scalable async operations  
✅ **Image Upload** - Multi-file uploads with ImageKit CDN  
✅ **OAuth Integration** - Google and GitHub authentication  
✅ **Rate Limiting** - Protection against brute-force attacks  
✅ **Test Coverage** - Automated tests for critical flows  

## ✨ Key Features

### 🔐 Authentication & Security
- JWT tokens stored in **HttpOnly cookies** (XSS-safe)
- Multi-provider OAuth (Google, GitHub)
- Two-factor authentication with OTP
- Password reset flow with email verification
- Rate limiting on sensitive endpoints
- Security headers with Helmet
- CORS protection with credentials support

### 💼 Gig Management
- Create gigs with multiple image uploads
- Search gigs by title (regex-based)
- Filter by status (open, assigned, completed)
- Owner-only edit/delete permissions
- Image storage with ImageKit CDN
- Automatic status transitions

### 💰 Bidding System
- Submit competitive bids on open gigs
- Unique constraint: one bid per freelancer per gig
- Cannot bid on your own gigs (backend validation)
- Update/delete pending bids
- Owner-only bid viewing

### 🔥 Atomic Hiring Logic (Critical Feature)

When a client clicks "Hire" on a bid, the following happens **atomically**:

```javascript
// Using MongoDB transactions for data consistency
const session = await mongoose.startSession();
session.startTransaction();

// 1. Update gig status: open → assigned
gig.status = "assigned";
await gig.save({ session });

// 2. Update selected bid: pending → hired
bid.status = "hired";
await bid.save({ session });

// 3. Reject all other pending bids
await Bid.updateMany(
  { gigId: gig._id, _id: { $ne: bid._id }, status: "pending" },
  { $set: { status: "rejected" } },
  { session }
);

await session.commitTransaction();
```

**Why this matters:**
- Prevents two freelancers from being hired for the same gig
- Handles concurrent hire requests safely
- Ensures database consistency
- Production-ready race condition protection

### ⚡ Real-time Features
- WebSocket authentication with cookies
- Live bid notifications for gig owners
- Instant hired/rejected status updates
- User presence tracking
- Auto-reconnection handling

### 📧 Email Notifications
- RabbitMQ message queue for async processing
- Gmail OAuth2 for sending emails
- OTP delivery for signup/login/password reset
- Bid confirmation emails
- Hire/rejection notifications

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database with replica set support |
| **Mongoose** | ODM with transaction support |
| **RabbitMQ** | Message broker for async tasks |
| **Socket.IO** | Real-time bidirectional communication |
| **Passport.js** | OAuth authentication (Google, GitHub) |
| **JWT** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **ImageKit** | Cloud image storage |
| **Nodemailer** | Email delivery |
| **Helmet** | Security headers |
| **express-rate-limit** | Brute-force protection |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool |
| **Redux Toolkit** | State management |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **Socket.IO Client** | Real-time events |
| **React Toastify** | Toast notifications |
| **Lottie React** | Animated illustrations |
| **Lucide React** | Icon library |


## 🏗 Architecture

### System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│   MongoDB   │
│  (React)    │  HTTP   │  (Express)  │  CRUD   │  (Replica)  │
│             │◀────────│             │◀────────│             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                        │
      │ WebSocket            │ AMQP                   │
      │                      │                         │
      ▼                      ▼                         ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Socket.IO  │         │  RabbitMQ   │         │   ImageKit  │
│   Server    │         │   Broker    │         │     CDN     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Nodemailer │
                        │   (Gmail)   │
                        └─────────────┘
```

### Data Flow: Hiring Process

```
1. Client clicks "Hire" on bid
   │
   ▼
2. Backend receives PATCH /api/bids/:bidId/hire
   │
   ▼
3. Start MongoDB transaction
   │
   ├─▶ Verify gig is still "open"
   ├─▶ Update gig: status = "assigned"
   ├─▶ Update selected bid: status = "hired"
   ├─▶ Reject other bids: status = "rejected"
   │
   ▼
4. Commit transaction (atomic)
   │
   ├─▶ Create notifications in DB
   ├─▶ Publish event to RabbitMQ
   ├─▶ Emit Socket.IO events
   │
   ▼
5. Freelancers receive real-time updates
```

### Authentication Flow

```
┌─────────────┐
│   Signup    │
└─────┬───────┘
      │
      ├─▶ Email/Password
      │   ├─▶ Generate OTP
      │   ├─▶ Send via RabbitMQ → Email
      │   └─▶ User verifies OTP
      │       └─▶ Set JWT in HttpOnly cookie
      │
      ├─▶ Google OAuth
      │   ├─▶ Redirect to Google
      │   ├─▶ Callback with user info
      │   └─▶ Set JWT in HttpOnly cookie
      │
      └─▶ GitHub OAuth
          ├─▶ Redirect to GitHub
          ├─▶ Callback with user info
          └─▶ Set JWT in HttpOnly cookie
```

## 📁 Project Structure

```
GigFlow/
├── backend/                   # Node.js backend
│   ├── src/
│   │   ├── app.js            # Express app configuration
│   │   ├── broker/           # RabbitMQ integration
│   │   │   ├── broker.js
│   │   │   └── notification.consumer.js
│   │   ├── config/           # Configuration files
│   │   │   ├── db.js         # MongoDB connection
│   │   │   └── passport.js   # OAuth strategies
│   │   ├── controllers/      # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── bid.controller.js
│   │   │   └── gig.controller.js
│   │   ├── middlewares/      # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── gig.model.js
│   │   │   ├── bid.model.js
│   │   │   └── notification.model.js
│   │   ├── routes/           # API routes
│   │   ├── services/         # External services
│   │   │   ├── email.service.js
│   │   │   └── imagekit.service.js
│   │   ├── sockets/          # WebSocket handlers
│   │   │   └── socket.server.js
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Request validation
│   ├── scripts/
│   │   └── test-hire.js      # Atomic transaction test
│   ├── server.js             # Entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── auth/
│   │   │   ├── gig/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── pages/            # Route pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── BrowseGigs.jsx
│   │   │   ├── GigDetail.jsx
│   │   │   ├── MyGigs.jsx
│   │   │   ├── MyBids.jsx
│   │   │   └── ...
│   │   ├── store/            # Redux state
│   │   │   ├── authSlice.js
│   │   │   ├── gigsSlice.js
│   │   │   └── bidsSlice.js
│   │   ├── utils/
│   │   │   ├── api.js        # API client
│   │   │   └── socket.js     # Socket client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── demo/             # Screenshots
│   │       ├── Demo-1.png
│   │       ├── Demo-2.png
│   │       ├── Demo-3.png
│   │       └── Demo-4.png
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── scripts/
│   └── init-mongo-replica.sh # Initialize MongoDB replica set
├── docker-compose.mongo.yml   # MongoDB Docker setup
├── .env.example               # Root environment template
└── README.md                  # This file
```

## 🔧 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher (with replica set support)
- **Docker** (optional): For running MongoDB replica set
- **RabbitMQ** (optional): For email notifications
- **ImageKit Account** (optional): For image uploads
- **Gmail OAuth2** (optional): For email delivery

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Aditya-KumarJha/GigFlow.git
cd GigFlow
```

### 2. Set Up MongoDB Replica Set (Required for Transactions)

#### Option A: Manual Setup

Follow MongoDB documentation to set up a replica set manually.

### 3. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigflow?replicaSet=rs0
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EMAIL_USER=your_email@gmail.com
REFRESH_TOKEN=your_gmail_oauth2_refresh_token
RABBITMQ_URL=amqps://username:password@host/vhost
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

**Terminal 3 - MongoDB (if using Docker):**
```bash
docker-compose -f docker-compose.mongo.yml up
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

## Images
Project contains demo images used by the frontend at `frontend/public/demo`. Use these in marketing/readme screenshots.

Screenshots (examples):

![Demo 1](frontend/public/demo/Demo-1.png)
![Demo 2](frontend/public/demo/Demo-2.png)
![Demo 3](frontend/public/demo/Demo-3.png)
![Demo 4](frontend/public/demo/Demo-4.png)
