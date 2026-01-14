import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import api from "../../utils/api";
import { useSelector, useDispatch } from 'react-redux'
import { setLoggedOut, verifySession } from '../../store/authSlice'
import { toast } from 'react-toastify'

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeTimer = useRef(null);

  const openDropdown = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setDropdownOpen(true);
  };

  const scheduleCloseDropdown = (delay = 180) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setDropdownOpen(false);
      closeTimer.current = null;
    }, delay);
  };
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
    }
    dispatch(setLoggedOut());
    toast.success('Logout successful');
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-2 sm:py-3"
          : "bg-white py-3 sm:py-5"
      } px-6 sm:px-8 md:px-14`}
    >
      <nav className="relative flex items-center justify-between w-full">

        {/* LOGO */}
        <a href="/" className="shrink-0 -ml-1 sm:ml-0">
          <h1
            className={`font-extrabold text-black transition-all duration-300 ${
              isScrolled ? "text-3xl sm:text-4xl" : "text-4xl lg:text-5xl"
            }`}
          >
            GigFlow
          </h1>
        </a>

        {/* CENTER NAV — Desktop / Tablet */}
        <div className="hidden md:flex items-center gap-8 lg:gap-14 absolute left-1/2 -translate-x-1/2">
          <a
            href="/browse-gigs"
            className={`tracking-wide text-zinc-600 hover:text-black transition-all duration-300 font-medium ${
              isScrolled ? "text-[15px]" : "text-[21.3px]"
            }`}
          >
            Browse Gigs
          </a>

          <a
            href="/post-gig"
            className={`tracking-wide text-zinc-600 hover:text-black transition-all duration-300 font-medium ${
              isScrolled ? "text-[15px]" : "text-[21.3px]"
            }`}
          >
            Post a Gig
          </a>

          {/* DASHBOARD */}
            <div
              className="relative"
              onMouseEnter={openDropdown}
              onMouseLeave={() => scheduleCloseDropdown()}
            >
              <span
                className={`tracking-wide text-zinc-600 hover:text-black transition-all duration-300 font-medium cursor-pointer ${
                  isScrolled ? "text-[15px]" : "text-[21.3px]"
                }`}
              >
                Dashboard
              </span>

              <div
                className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-white rounded-xl shadow-lg border border-zinc-100 z-50 ${dropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-150`}
                onMouseEnter={openDropdown}
                onMouseLeave={() => scheduleCloseDropdown()}
              >
                <a href="/update-profile" className="block px-5 py-3 text-zinc-700 hover:bg-zinc-50 rounded-t-xl">
                  Update Profile
                </a>
                <a href="/my-gigs" className="block px-5 py-3 text-zinc-700 hover:bg-zinc-50">
                  My Gigs
                </a>
                <a href="/my-bids" className="block px-5 py-3 text-zinc-700 hover:bg-zinc-50">
                  My Bids
                </a>
                <a href="/notifications" className="block px-5 py-3 text-zinc-700 hover:bg-zinc-50 rounded-b-xl">
                  Notifications
                </a>
              </div>
            </div>
        </div>

        {/* RIGHT CTA — Desktop / Tablet */}
        <div className="hidden md:block shrink-0">
          {auth.isAuthenticated ? (
            <Button
              variant="primary"
              size="md"
              className={`transition-all duration-300 ${
                isScrolled ? "text-sm px-4 py-2" : "text-base px-5 py-3"
              }`}
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              className={`transition-all duration-300 ${
                isScrolled ? "text-sm px-4 py-2" : "text-base px-5 py-3"
              }`}
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          )}
        </div>

        {/* HAMBURGER / CLOSE — Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative w-10 h-10 rounded-lg border border-zinc-200 flex items-center justify-center"
          aria-label="Toggle Menu"
        >
          <span className="sr-only">Menu</span>

          {/* Top bar */}
          <span
            className={`absolute w-5 h-0.5 bg-black transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
            }`}
          />

          {/* Middle bar */}
          <span
            className={`absolute w-5 h-0.5 bg-black transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Bottom bar */}
          <span
            className={`absolute w-5 h-0.5 bg-black transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
            }`}
          />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 rounded-xl bg-white shadow-lg border border-zinc-100 overflow-hidden">
          <a href="/browse-gigs" className="block px-6 py-4 text-zinc-700 hover:bg-zinc-50">
            Browse Gigs
          </a>
          <a href="/post-gig" className="block px-6 py-4 text-zinc-700 hover:bg-zinc-50">
            Post a Gig
          </a>
          <a href="/update-profile" className="block px-6 py-4 text-zinc-700 hover:bg-zinc-50">
            Update Profile
          </a>
          <a href="/my-gigs" className="block px-6 py-4 text-zinc-700 hover:bg-zinc-50">
            My Gigs
          </a>
          <a href="/my-bids" className="block px-6 py-4 text-zinc-700 hover:bg-zinc-50">
            My Bids
          </a>
          <a href="/notifications" className="block px-6 py-4 text-zinc-700 hover:bg-zinc-50">
            Notifications
          </a>

          <div className="border-t border-zinc-100">
              <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (auth.isAuthenticated) {
                  handleLogout();
                } else {
                  navigate("/signup");
                }
              }}
              className="w-full text-left px-6 py-4 font-medium text-black hover:bg-zinc-50"
            >
              {auth.isAuthenticated ? 'Logout' : 'Get Started'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
