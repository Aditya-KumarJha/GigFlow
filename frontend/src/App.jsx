import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Header from "./components/layout/Header";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = () => {
    try {
      if (localStorage.getItem('authToken')) return true;
      return document.cookie.split(';').some(c => c.trim().startsWith('token='));
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const protectedPaths = ['/browse-gigs', '/post-gig', '/update-profile', '/my-gigs', '/my-bids', '/dashboard'];
    const current = location.pathname;
    const needsProtection = protectedPaths.some(p => current === p || current.startsWith(p + '/'));
    if (needsProtection && !isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: current } });
    }
  }, [location, navigate]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
};

export default App;
