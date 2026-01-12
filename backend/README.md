# GigFlow Backend - Authentication System

## 🎯 Overview

Complete authentication system for GigFlow with JWT, HttpOnly cookies, OAuth (Google/GitHub), and email verification.

## ✅ Implemented Features

### 1. **Email/Password Authentication**
- ✅ User registration with OTP verification
- ✅ Login with 2FA (OTP via email)
- ✅ Forgot password with OTP reset
- ✅ Password reset functionality
- ✅ Resend OTP capability

### 2. **OAuth Authentication**
- ✅ Google OAuth 2.0
- ✅ GitHub OAuth
- ✅ Separate login/signup flows

### 3. **Security Features**
- ✅ JWT stored in HttpOnly cookies (XSS protection)
- ✅ Helmet.js for security headers
- ✅ CORS configured for frontend
- ✅ Rate limiting on auth endpoints
- ✅ Strict rate limiting on OTP endpoints (5 requests/15 min)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email verification required before access

### 4. **Email Notifications**
- ✅ Non-blocking email sending via RabbitMQ
- ✅ Registration OTP emails
- ✅ Login OTP emails
- ✅ Forgot password OTP emails
- ✅ Welcome emails
- ✅ Login success notifications
- ✅ Password update confirmations
- ✅ OAuth welcome emails

### 5. **User Model Features**
- ✅ Flexible schema (email + OAuth)
- ✅ Same user can be both client and freelancer
- ✅ Support for multiple auth providers
- ✅ Profile picture support
- ✅ Email verification status

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app with middleware
│   ├── broker/
│   │   ├── broker.js              # RabbitMQ connection & helpers
│   │   └── notification.consumer.js # Email consumers
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── passport.js            # OAuth strategies
│   ├── controllers/
│   │   └── auth.controller.js     # Auth business logic
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT verification middleware
│   ├── models/
│   │   └── user.model.js          # User schema
│   ├── routes/
│   │   └── auth.routes.js         # Auth endpoints
│   ├── services/
│   │   └── email.service.js       # Nodemailer configuration
│   ├── utils/
│   │   └── generate.otp.js        # OTP generation utility
│   └── validators/
│       └── auth.validator.js      # Request validation
├── server.js                      # Entry point
├── .env                          # Environment variables (not in git)
├── .env.example                  # Example environment file
└── package.json                  # Dependencies
```

## 🔌 API Endpoints

### **Registration Flow**
```
POST /api/auth/register
POST /api/auth/verify-register-otp
POST /api/auth/resend-otp
```

### **Login Flow**
```
POST /api/auth/login
POST /api/auth/verify-login-otp
```

### **Password Reset Flow**
```
POST /api/auth/forgot-password
POST /api/auth/verify-forgot-password-otp
POST /api/auth/reset-password
```

### **OAuth Flow**
```
GET  /api/auth/google           # Login with Google
GET  /api/auth/google/signup    # Signup with Google
GET  /api/auth/google/callback  # Google callback

GET  /api/auth/github           # Login with GitHub
GET  /api/auth/github/signup    # Signup with GitHub
GET  /api/auth/github/callback  # GitHub callback
```

### **User Management**
```
POST /api/auth/logout           # Clear JWT cookie
GET  /api/auth/me              # Get current user (protected)
```

### **Utility**
```
GET  /health                   # Health check endpoint
```

## 🔐 Authentication Middleware

### `authMiddleware`
Protects routes requiring authentication. Verifies JWT from HttpOnly cookie.

**Usage:**
```javascript
import { authMiddleware } from './middlewares/auth.middleware.js';

router.post('/api/gigs', authMiddleware, createGig);
```

**Behavior:**
- Extracts JWT from `req.cookies.token`
- Verifies signature and expiration
- Fetches user from database
- Attaches `req.user` object
- Returns 401 if invalid/missing token

### `optionalAuth` (Bonus)
Makes authentication optional. Sets `req.user` to `null` if not authenticated.

## 🛡️ Security Configuration

### CORS
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:5173'
credentials: true  // Allow cookies
```

### Rate Limiting
- **Auth endpoints**: 10 requests/15 min per IP
- **OTP endpoints**: 5 requests/15 min per IP

### Helmet
Security headers enabled with cross-origin resource policy.

### JWT Cookies
```javascript
httpOnly: true,           // No JS access
secure: NODE_ENV === 'production',  // HTTPS only in prod
sameSite: 'strict',       // CSRF protection
maxAge: 7 days
```

## 📧 Email System Architecture

### RabbitMQ Queues
- `AUTH_NOTIFICATION.REGISTER_OTP`
- `AUTH_NOTIFICATION.RESEND_OTP`
- `AUTH_NOTIFICATION.LOGIN_OTP`
- `AUTH_NOTIFICATION.FORGOT_PASSWORD_OTP`
- `AUTH_NOTIFICATION.WELCOME_USER`
- `AUTH_NOTIFICATION.LOGIN_SUCCESS`
- `AUTH_NOTIFICATION.PASSWORD_UPDATED`
- `AUTH_NOTIFICATION.OAUTH_WELCOME`

### Flow
1. Controller publishes event to queue
2. Consumer picks up event asynchronously
3. Email sent via Nodemailer (Gmail OAuth2)
4. Non-blocking - user gets immediate response

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Services
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Test Health Check
```bash
curl http://localhost:3000/health
```

## 🧪 Testing Authentication Flow

### Email Registration
```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": {"firstName": "John", "lastName": "Doe"},
    "username": "johndoe"
  }'

# 2. Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-register-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Login
```bash
# 1. Login (sends OTP)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'

curl -X POST http://localhost:3000/api/auth/verify-login-otp \
# 2. Verify OTP (sets cookie)
curl -X POST http://localhost:3000/api/auth/verify-login-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## ✨ Next Steps for GigFlow

### Required Models (for Phase 2)
```javascript
// gig.model.js
{
  title: String,
  description: String,
  budget: Number,
  ownerId: ObjectId (ref: 'User'),
  status: { type: String, enum: ['open', 'assigned'] }
}

// bid.model.js
{
  gigId: ObjectId (ref: 'Gig'),
  freelancerId: ObjectId (ref: 'User'),
  message: String,
  price: Number,
  status: { type: String, enum: ['pending', 'hired', 'rejected'] }
}
```

### Required Routes (for Phase 2)
```javascript
// Gig Management
GET    /api/gigs              # Browse open gigs
POST   /api/gigs              # Create gig (auth)
GET    /api/gigs/:id          # Get gig details
PATCH  /api/gigs/:id          # Update gig (auth, owner only)
DELETE /api/gigs/:id          # Delete gig (auth, owner only)

// Bid Management
POST   /api/bids              # Submit bid (auth)
GET    /api/bids/:gigId       # View bids (auth, owner only)
PATCH  /api/bids/:id/hire     # Hire freelancer (auth, owner only)
```

### Critical Hire Logic (Phase 2)
When client hires a freelancer:
```javascript
// 1. Update selected bid: pending → hired
// 2. Update gig: open → assigned
// 3. Reject all other bids: pending → rejected
// Use MongoDB transactions for atomicity!
```

## 📝 Environment Variables Reference

See `.env.example` for detailed setup instructions.

**Critical Variables:**
- `JWT_SECRET` - Use `openssl rand -hex 32`
- `MONGODB_URI` - MongoDB Atlas connection string
- `FRONTEND_URL` - For CORS and OAuth redirects
- `RABBITMQ_URL` - CloudAMQP connection string

## 🔍 Debugging

### Check RabbitMQ Connection
Look for: `Connected to RabbitMQ` in console

### Check MongoDB Connection
Look for: `Connected to MongoDB` in console

### Check Email Service
Look for: `Email server is ready to send messages` in console

### Check Rate Limiting
Headers in response:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

## 📊 Current Status

✅ **Authentication: 100% Complete**
- Email/Password flow
- OAuth (Google/GitHub)
- JWT + HttpOnly cookies
- Security middleware
- Email notifications
- Rate limiting

⏳ **Gig Management: Not Started**
⏳ **Bid Management: Not Started**
⏳ **Hire Logic: Not Started**

---

**Ready for Phase 2: Gig & Bid System Implementation**
