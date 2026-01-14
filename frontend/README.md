# GigFlow Frontend 🎨

A modern, responsive React-based frontend for the GigFlow freelance marketplace platform. Built with React, Redux Toolkit, and Tailwind CSS, featuring real-time updates via Socket.IO and smooth animations with Framer Motion.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Key Features](#key-features)
- [State Management](#state-management)
- [Real-time Features](#real-time-features)
- [Authentication Flow](#authentication-flow)
- [Screenshots](#screenshots)

## ✨ Features

### Authentication & User Management
- **Multi-Provider Authentication**: Email/Password, Google OAuth2, GitHub OAuth
- **OTP Verification**: Two-factor authentication for signup and login
- **Password Recovery**: Secure forgot password flow
- **Profile Management**: Update profile with image upload
- **Session Management**: JWT-based authentication with HttpOnly cookies

### Gig Marketplace
- **Browse Gigs**: Infinite scroll with search and filter capabilities
- **Post Gigs**: Create gigs with multiple image uploads
- **Gig Details**: Detailed view with image gallery
- **My Gigs**: Manage your posted gigs with edit/delete options
- **Status Tracking**: Visual indicators for open, assigned, and completed gigs

### Bidding System
- **Submit Bids**: Propose your price and pitch for gigs
- **My Bids**: Track all your submitted bids and their status
- **Bid Management**: Update or delete pending bids
- **View Bids**: Gig owners can view and manage all bids received
- **Hire Freelancers**: One-click hiring with real-time status updates

### Real-time Features
- **Live Notifications**: Instant updates when bids are accepted/rejected
- **Socket Integration**: WebSocket connection for real-time events
- **Toast Notifications**: User-friendly notification system
- **Status Sync**: Real-time gig and bid status synchronization

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for page transitions and interactions
- **Lottie Animations**: Engaging animated illustrations
- **Infinite Scroll**: Seamless pagination for gig listings
- **Image Gallery**: Interactive image viewer with thumbnails
- **Loading States**: Skeleton loaders and loading indicators

## 🛠 Tech Stack

### Core Technologies
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.12.0
- **State Management**: Redux Toolkit 2.2.1 with React Redux 9.1.0

### Styling & UI
- **CSS Framework**: Tailwind CSS 4.1.18
- **Animations**: Framer Motion 12.26.1
- **Icons**: Lucide React 0.562.0, React Icons 5.5.0
- **Lottie**: lottie-react 2.4.1
- **3D Effects**: react-parallax-tilt 1.7.315

### Real-time & Networking
- **WebSocket Client**: socket.io-client 4.7.2
- **HTTP Client**: Native Fetch API with credentials
- **Notifications**: react-toastify 11.0.5

### Development Tools
- **Linter**: ESLint 9.39.1
- **Type Support**: TypeScript definitions for React

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── demo/                 # Screenshots for documentation
│   │   ├── Demo-1.png
│   │   ├── Demo-2.png
│   │   ├── Demo-3.png
│   │   └── Demo-4.png
│   ├── herosection/          # Hero section images
│   ├── logos/                # Brand logos
│   └── testimonials/         # Testimonial images
├── src/
│   ├── assets/               # App-specific assets
│   ├── components/           # Reusable components
│   │   ├── auth/            # Authentication components
│   │   │   ├── AnimationPanel.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── OTPForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── SocialButtons.jsx
│   │   ├── gig/             # Gig-related components
│   │   │   └── GigCard.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── HowItWorks.jsx
│   │   ├── sections/        # Page sections
│   │   │   ├── HeroSection.jsx
│   │   │   └── Testimonials.jsx
│   │   └── ui/              # UI primitives
│   │       ├── Button.jsx
│   │       ├── EmailInput.jsx
│   │       ├── FlipText.jsx
│   │       ├── HoverExpand.jsx
│   │       ├── ImageCursorTrail.jsx
│   │       └── TextHover.jsx
│   ├── lottie/              # Lottie animation files
│   │   ├── animation-1.json
│   │   ├── animation-2.json
│   │   └── animation-3.json
│   ├── pages/               # Application pages
│   │   ├── BrowseGigs.jsx
│   │   ├── GigDetail.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyBids.jsx
│   │   ├── MyGigs.jsx
│   │   ├── Notifications.jsx
│   │   ├── PostGig.jsx
│   │   ├── SignupPage.jsx
│   │   └── UpdateProfile.jsx
│   ├── store/               # Redux state management
│   │   ├── authSlice.js     # Authentication state
│   │   ├── bidsSlice.js     # Bids state
│   │   ├── gigsSlice.js     # Gigs state
│   │   └── store.js         # Store configuration
│   ├── utils/               # Utility functions
│   │   ├── api.js           # API client with credentials
│   │   └── socket.js        # Socket.IO client
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Environment variables template
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package.json             # Dependencies
├── README.md                # This file
└── vite.config.js           # Vite configuration
```

## 🔧 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **Backend**: GigFlow backend server running on configured URL

## 📦 Installation

1. **Clone the repository** (if not already done)

```bash
git clone https://github.com/Aditya-KumarJha/GigFlow.git
cd GigFlow/frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
VITE_API_URL=http://localhost:3000
```

For production, set this to your deployed backend URL.

## 🌍 Environment Variables

Create a `.env` file in the frontend directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

**Important**: All Vite environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Production Build

```bash
npm run build
```

The optimized production build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🎯 Key Features

### 1. Authentication Flow

#### Signup Process
1. User enters email, username, password on signup page
2. OTP is sent to email (backend sends via RabbitMQ → Nodemailer)
3. User verifies OTP
4. JWT token set in HttpOnly cookie
5. User redirected to browse gigs

#### Login Process
1. User enters email/username and password
2. Backend validates credentials and sends OTP
3. User verifies OTP
4. JWT token set in HttpOnly cookie
5. User redirected to dashboard

#### OAuth Flow (Google/GitHub)
1. User clicks OAuth button
2. Redirected to provider for authentication
3. Backend handles callback and sets JWT cookie
4. User redirected to frontend with success message

### 2. Gig Management

#### Posting a Gig
```javascript
// Component: PostGig.jsx
- Upload up to 3 images (drag-and-drop supported)
- Enter title, description, budget
- Submit creates gig with status "open"
- Real-time notification to backend via RabbitMQ
```

#### Browsing Gigs
```javascript
// Component: BrowseGigs.jsx
- Infinite scroll pagination
- Search by title (regex-based)
- Filter by status (open/assigned/completed)
- Only "open" gigs shown by default
- Click card to view details
```

#### My Gigs
```javascript
// Component: MyGigs.jsx
- Shows gigs you own OR gigs you're assigned to
- Edit/Delete options for owned gigs
- View assigned freelancer for assigned gigs
- Status indicators
```

### 3. Bidding System

#### Submitting a Bid
```javascript
// Component: GigDetail.jsx (Freelancer View)
- Enter proposal message and price
- Cannot bid on own gigs (enforced on backend)
- Cannot bid twice on same gig (unique constraint)
- Real-time notification to gig owner
```

#### Managing Bids
```javascript
// Component: GigDetail.jsx (Owner View)
- View all bids with freelancer details
- Hire button for each pending bid
- Hiring triggers atomic transaction:
  - Gig status: open → assigned
  - Selected bid: pending → hired
  - Other bids: pending → rejected
- Real-time socket events to all bidders
```

#### My Bids
```javascript
// Component: MyBids.jsx
- Track all submitted bids
- Status indicators: pending/hired/rejected
- Update/Delete pending bids
- Real-time status updates via Socket.IO
```

### 4. Real-time Features

#### Socket.IO Integration

```javascript
// utils/socket.js
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL;
let socket = null;

export function initSocket() {
  if (socket) return socket;
  
  socket = io(API_BASE, {
    path: '/api/socket/socket.io/',
    withCredentials: true,  // Send cookies for auth
    transports: ['websocket', 'polling'],
  });
  
  return socket;
}
```

#### Event Handlers

```javascript
// App.jsx - Global Socket Listeners
socket.on('bid_hired', (data) => {
  toast.success('You have been hired!');
});

socket.on('bid_rejected', (data) => {
  toast.info('Your bid was not selected');
});

socket.on('new_bid', (data) => {
  toast.info('New bid received on your gig');
});
```

## 🗂 State Management

### Redux Store Structure

```javascript
// store/store.js
{
  auth: {
    isAuthenticated: boolean,
    checked: boolean,
    user: { _id, email, username, fullName, profilePic }
  },
  gigs: {
    items: [...],
    loading: boolean,
    error: string | null
  },
  bids: {
    byGigId: {
      [gigId]: {
        items: [...],
        loading: boolean,
        error: string | null
      }
    }
  }
}
```

### Auth Slice

```javascript
// store/authSlice.js
- verifySession: Async thunk to validate token on mount
- setAuthenticated: Set user as logged in
- setLoggedOut: Clear auth state
- initializeAuth: Check localStorage and cookie for token
```

### Bids Slice

```javascript
// store/bidsSlice.js
- fetchBidsForGig: Load all bids for a gig (owner only)
- submitBid: Submit new bid
- hireBid: Accept a bid (triggers atomic transaction)
- updateBid: Modify pending bid
- deleteBid: Remove pending bid
```

### Gigs Slice

```javascript
// store/gigsSlice.js
- fetchGigs: Load paginated gigs with search/filter
- fetchGigById: Load single gig details
- createGig: Post new gig with images
- updateGig: Modify existing gig
- deleteGig: Remove gig
```

## 🔐 Authentication Implementation

### API Client with Credentials

```javascript
// utils/api.js
const config = {
  method,
  credentials: "include",  // CRITICAL: Send HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    ...headers
  }
};

// For file uploads, use FormData without Content-Type header
if (body instanceof FormData) {
  config.body = body;
  delete config.headers['Content-Type'];  // Browser sets multipart boundary
}
```

### Protected Routes

```javascript
// App.jsx
const ProtectedRoute = ({ children }) => {
  const auth = useSelector(state => state.auth);
  
  if (!auth.checked) return <div>Loading...</div>;
  if (!auth.isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

// Usage
<Route path="/gigs/new" element={
  <ProtectedRoute>
    <PostGig />
  </ProtectedRoute>
} />
```

## 📸 Screenshots

### Home Page
![Home Page](./public/demo/Demo-1.png)

*Modern landing page with hero section, testimonials, and how it works section*

### Browse Gigs
![Browse Gigs](./public/demo/Demo-2.png)

*Infinite scroll gig listing with search and filter capabilities*

### Gig Details & Bidding
![Gig Details](./public/demo/Demo-3.png)

*Detailed gig view with image gallery and bid submission form*

### My Bids Dashboard
![My Bids](./public/demo/Demo-4.png)

*Track all submitted bids with real-time status updates*

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Signup with email/password
   - [ ] OTP verification
   - [ ] Login with credentials
   - [ ] Google OAuth login
   - [ ] GitHub OAuth login
   - [ ] Logout functionality

2. **Gig Management**
   - [ ] Post gig with images
   - [ ] Search gigs by title
   - [ ] Filter by status
   - [ ] Edit owned gig
   - [ ] Delete owned gig

3. **Bidding**
   - [ ] Submit bid on open gig
   - [ ] Cannot bid on own gig
   - [ ] Cannot bid twice on same gig
   - [ ] View bids as gig owner
   - [ ] Hire a freelancer
   - [ ] Receive real-time hired notification
   - [ ] Receive real-time rejected notification

4. **Real-time**
   - [ ] Socket connection on login
   - [ ] Toast notifications appear
   - [ ] Status updates without refresh

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Network error: Unable to connect to server"
- **Solution**: Ensure backend is running on `VITE_API_URL`

**Issue**: "Authentication required" on protected routes
- **Solution**: Check that `credentials: 'include'` is set in API requests

**Issue**: Real-time updates not working
- **Solution**: Verify Socket.IO connection and check browser console for errors

**Issue**: Images not uploading
- **Solution**: Ensure FormData is used and Content-Type header is not set manually

## 📝 Environment-Specific Configurations

### Development
```env
VITE_API_URL=http://localhost:3000
```

### Staging
```env
VITE_API_URL=https://staging-api.gigflow.com
```

### Production
```env
VITE_API_URL=https://api.gigflow.com
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variable in Vercel dashboard:
- `VITE_API_URL`: Your production backend URL

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Add environment variable in Netlify dashboard:
- `VITE_API_URL`: Your production backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aditya Kumar Jha**
- GitHub: [@Aditya-KumarJha](https://github.com/Aditya-KumarJha)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for utility-first styling
- Framer Motion for smooth animations
- Socket.IO for real-time capabilities
- Vite for lightning-fast builds
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
