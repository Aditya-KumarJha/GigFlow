# GigFlow Backend 🚀

A robust and scalable backend API for a freelance marketplace platform built with Node.js, Express, and MongoDB. GigFlow enables users to post gigs, submit bids, and connect in real-time through WebSockets.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Real-time Features](#real-time-features)
- [Security Features](#security-features)
- [Contributing](#contributing)

## ✨ Features

### Authentication & Authorization
- **Multi-provider Authentication**: Email/Password, Google OAuth2, GitHub OAuth
- **Two-Factor Authentication**: OTP-based verification for registration and login
- **Password Recovery**: Secure forgot password flow with OTP verification
- **JWT-based Sessions**: Secure token-based authentication with HTTP-only cookies
- **Profile Management**: Update profile with image upload support

### Gig Management
- **CRUD Operations**: Create, read, update, and delete gigs
- **Image Upload**: Multiple image uploads with ImageKit integration
- **Search & Filter**: Text-based search and status filtering
- **Access Control**: Owner-based permissions for gig modifications
- **Status Tracking**: Open, assigned, and completed states

### Bidding System
- **Bid Submission**: Freelancers can submit bids on open gigs
- **Bid Management**: View all bids for owned gigs
- **Hiring Process**: Accept bids and update gig status
- **User Bid History**: Track all submitted bids
- **Duplicate Prevention**: Unique constraint on gig-freelancer pairs

### Real-time Communication
- **WebSocket Support**: Socket.IO integration for live updates
- **User Presence**: Track online users
- **Real-time Notifications**: Instant bid and gig updates

### Messaging & Notifications
- **RabbitMQ Integration**: Message queue for asynchronous notifications
- **Email Notifications**: Automated emails for OTP, password reset, and updates
- **Event-driven Architecture**: Decoupled notification system

## 🛠 Tech Stack

### Core Technologies
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Message Broker**: RabbitMQ (AMQP)
- **Real-time**: Socket.IO

### Authentication & Security
- **Authentication**: Passport.js (Google, GitHub strategies)
- **Password Hashing**: bcryptjs
- **JWT**: jsonwebtoken
- **Security Headers**: Helmet
- **Rate Limiting**: express-rate-limit
- **CORS**: cors middleware

### File Upload & Storage
- **Upload Handler**: Multer
- **Cloud Storage**: ImageKit

### Email Service
- **Email Client**: Nodemailer (OAuth2)

### Validation & Utilities
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **Logging**: morgan
- **UUID**: uuid

## 📁 Project Structure

```
backend/
├── server.js                 # Entry point & server initialization
├── src/
│   ├── app.js               # Express app configuration & middleware
│   ├── broker/              # RabbitMQ message broker
│   │   ├── broker.js        # Queue connection & utilities
│   │   └── notification.consumer.js  # Notification consumer
│   ├── config/              # Configuration files
│   │   ├── db.js            # MongoDB connection
│   │   └── passport.js      # Passport OAuth strategies
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.js     # Authentication logic
│   │   ├── bid.controller.js      # Bid management
│   │   └── gig.controller.js      # Gig operations
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.middleware.js     # JWT verification
│   │   └── upload.middleware.js   # Multer file upload
│   ├── models/              # Mongoose schemas
│   │   ├── user.model.js    # User schema
│   │   ├── gig.model.js     # Gig schema
│   │   └── bid.model.js     # Bid schema
│   ├── routes/              # API routes
│   │   ├── auth.routes.js   # Authentication endpoints
│   │   ├── bid.routes.js    # Bid endpoints
│   │   └── gig.routes.js    # Gig endpoints
│   ├── services/            # External services
│   │   ├── email.service.js       # Email sending
│   │   └── imagekit.service.js    # Image upload/delete
│   ├── sockets/             # WebSocket handlers
│   │   └── socket.server.js       # Socket.IO server
│   ├── utils/               # Utility functions
│   │   └── generate.otp.js        # OTP generation
│   └── validators/          # Request validation
│       ├── auth.validator.js
│       ├── bid.validator.js
│       └── gig.validator.js
├── package.json
└── .env.example
```

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud instance)
- **RabbitMQ** (local or CloudAMQP instance)

### External Services Required:
- **ImageKit** account (for image storage)
- **Google Cloud Console** (for OAuth)
- **GitHub OAuth App** (for OAuth)
- **Gmail** with OAuth2 (for email service)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GigFlow/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual credentials (see [Environment Variables](#environment-variables))

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Start RabbitMQ** (if running locally)
   ```bash
   rabbitmq-server
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_super_secret_jwt_key_here

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Service (Gmail OAuth2)
EMAIL_USER=your_email@gmail.com
REFRESH_TOKEN=your_gmail_oauth2_refresh_token

# Message Broker
RABBITMQ_URL=amqps://<username>:<password>@<host>/<vhost>

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### How to Get Credentials:

**MongoDB Atlas:**
1. Create account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/github/callback`

**ImageKit:**
1. Sign up at [imagekit.io](https://imagekit.io)
2. Get API keys from Developer section

**RabbitMQ:**
1. Use [CloudAMQP](https://www.cloudamqp.com) for cloud instance
2. Or install locally: [RabbitMQ Installation](https://www.rabbitmq.com/download.html)

**Gmail OAuth2 Refresh Token:**
1. Follow [Nodemailer OAuth2 Guide](https://nodemailer.com/smtp/oauth2/)

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Server will start on `http://localhost:3000` with auto-reload

### Production Mode
```bash
npm start
```

### Health Check
Visit `http://localhost:3000/` to verify server is running

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Verify Registration OTP
```http
POST /auth/verify-register-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Verify Login OTP
```http
POST /auth/verify-login-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### OAuth Login
```http
GET /auth/google
GET /auth/google/signup
GET /auth/github
GET /auth/github/signup
```

#### Resend OTP
```http
POST /auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "profilePic": <file>
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Gig Endpoints

#### Get All Gigs
```http
GET /gigs?page=1&limit=10&status=open&search=web
```

#### Get Gig by ID
```http
GET /gigs/:id
```

#### Create Gig
```http
POST /gigs
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Build a website",
  "description": "Need a responsive website...",
  "budget": 500,
  "images": [<file1>, <file2>]
}
```

#### Update Gig
```http
PATCH /gigs/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Updated title",
  "budget": 600,
  "images": [<new_file>]
}
```

#### Delete Gig
```http
DELETE /gigs/:id
Authorization: Bearer <token>
```

#### Delete Gig Image
```http
DELETE /gigs/:id/images/:imageId
Authorization: Bearer <token>
```

### Bid Endpoints

#### Submit Bid
```http
POST /bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "gigId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "price": 450,
  "message": "I can complete this project..."
}
```

#### Get Bids for a Gig (Owner Only)
```http
GET /bids/:gigId
Authorization: Bearer <token>
```

#### Get My Bids
```http
GET /bids/my-bids
Authorization: Bearer <token>
```

#### Hire a Bidder
```http
PATCH /bids/:bidId/hire
Authorization: Bearer <token>
```

### Response Format

**Success Response:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "errors": [ ... ]  // Validation errors if applicable
}
```

## 🔄 Real-time Features

### WebSocket Connection

**Endpoint:** `ws://localhost:3000/api/socket/socket.io/`

**Authentication:** JWT token passed via cookie

**Events:**
- `connection` - User connects
- `disconnect` - User disconnects
- `ping/pong` - Heartbeat for connection health


## 🔒 Security Features

### Rate Limiting
- **Auth endpoints**: 10 requests per 15 minutes
- **OTP endpoints**: 5 requests per 15 minutes

### Security Headers
- Helmet.js configured for secure HTTP headers
- Cross-Origin Resource Policy enabled

### CORS
- Configured to allow requests from frontend URL only
- Credentials enabled for cookie-based auth

### Password Security
- bcrypt hashing with salt rounds
- Minimum 6 characters required

### JWT Security
- HTTP-only cookies prevent XSS attacks
- Short-lived tokens for enhanced security

### Input Validation
- express-validator for all user inputs
- Schema validation on all endpoints

### File Upload Security
- File size limits (10MB)
- Type validation for images
- Secure storage with ImageKit

## 🧪 Testing

```bash
npm test
```
*Note: Test scripts need to be configured*

## 🐛 Debugging

Enable detailed logging:
```env
NODE_ENV=development
```

Morgan logger will output HTTP requests in development mode.

## 📦 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Enable MongoDB Atlas IP whitelist
4. Configure production CORS origins
5. Set up SSL/TLS certificates
6. Use process manager (PM2)
7. Set up monitoring and logging

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name gigflow-backend
pm2 save
pm2 startup
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Express.js community
- MongoDB and Mongoose
- Socket.IO team
- All open-source contributors

## 📞 Support

For support, email support@gigflow.com or open an issue in the repository.

---

**Built with ❤️ by the GigFlow Team**
