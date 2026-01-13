import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import PostGig from './pages/PostGig';
import BrowseGigs from './pages/BrowseGigs';
import { useSelector, useDispatch } from 'react-redux'
import { verifySession } from './store/authSlice'
import { toast } from 'react-toastify'
import { useRef } from 'react'

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const prevAuthRef = useRef(auth.isAuthenticated);

  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch]);

  useEffect(() => {
    if (!auth.checked) return;

    const initiated = localStorage.getItem('auth_initiated');
    if (initiated) {
      if (auth.isAuthenticated && !prevAuthRef.current) {
        let action = 'login';
        if (initiated.startsWith && initiated.startsWith('social:')) {
          const parts = initiated.split(':');
          action = parts[1] || 'login';
        }
        const message = action === 'signup' ? 'Signup successful' : 'Login successful';
        toast.success(message);
        localStorage.removeItem('auth_initiated');
      } else if (!auth.isAuthenticated && !prevAuthRef.current && auth.checked) {
        let action = 'login';
        if (initiated.startsWith && initiated.startsWith('social:')) {
          const parts = initiated.split(':');
          action = parts[1] || 'login';
        }
        const message = action === 'signup' ? 'Signup failed' : 'Login failed';
        toast.error(message + ". Please try again.");
        localStorage.removeItem('auth_initiated');
      }
    }
    prevAuthRef.current = auth.isAuthenticated;

    const protectedPaths = ['/browse-gigs', '/post-gig', '/update-profile', '/my-gigs', '/my-bids', '/dashboard'];
    const current = location.pathname;
    const needsProtection = protectedPaths.some(p => current === p || current.startsWith(p + '/'));
    if (needsProtection && !auth.isAuthenticated) {
      navigate('/login', { replace: true, state: { from: current } });
    }
  }, [location, navigate, auth.isAuthenticated, auth.checked]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse-gigs" element={<BrowseGigs />} />
        <Route path="/post-gig" element={<PostGig />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
};

export default App;
