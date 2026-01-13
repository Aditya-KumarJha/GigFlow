import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../utils/api";
import { toast } from 'react-toastify';

const LoginForm = ({
  setOtpStep,
  setUserEmail,
  setForgotStep,
  errorMessage,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setServerError(error);
      toast.error(error);
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
    const reset = searchParams.get("reset");
    if (reset) {
      setSuccessMessage("Your password has been reset. Please login with your new password.");
      toast.success("Your password has been reset. Please login with your new password.");
      searchParams.delete("reset");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: form.email.trim() === "",
      password: form.password.trim() === "",
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setLoading(true);
      setServerError(null);

      await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      setUserEmail(form.email);
      setOtpStep(true);
    } catch (err) {
      // Handle validation errors from backend
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = validationErrors.map(e => e.msg).join('. ');
        setServerError(errorMessages);
        toast.error(errorMessages);
      } else {
        setServerError(
          err.response?.data?.message || "Login failed. Please try again."
        );
        toast.error(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  

  const handleSocialLogin = (provider) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    if (provider === "Google") {
      try { localStorage.setItem('auth_initiated', 'social:login:google'); } catch(e) {}
      window.location.href = `${baseUrl}/api/auth/google`;
      return;
    }

    if (provider === "GitHub") {
      try { localStorage.setItem('auth_initiated', 'social:login:github'); } catch(e) {}
      window.location.href = `${baseUrl}/api/auth/github`;
      return;
    }

    // provider login not implemented
  };

  const inputBaseClasses =
    "w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-gray-900 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-cyan-400 outline-none transition";

  return (
    <div className="bg-white border border-zinc-200 backdrop-blur-md p-10 flex flex-col justify-center text-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

      <p className="text-sm text-gray-600 text-center mb-8">
        Enter your credentials below to access your account.
      </p>

      <SocialButtons onClick={handleSocialLogin} />

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-zinc-200 flex-1" />
        <span className="text-xs text-gray-500">
          or continue with email
        </span>
        <div className="h-px bg-zinc-200 flex-1" />
      </div>

      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border-l-4 border-green-500 text-green-800">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {(errorMessage || serverError) && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-800">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-sm">{errorMessage || serverError}</p>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className={`${inputBaseClasses} ${
              errors.email ? "border-red-500" : "border-zinc-200"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              Please fill this field
            </p>
          )}
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`${inputBaseClasses} ${
              errors.password ? "border-red-500" : "border-zinc-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-3 text-gray-500 hover:text-teal-500 transition"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              Please fill this field
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-teal-400 to-cyan-500 rounded-lg text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setForgotStep(true)}
            className="text-sm text-teal-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-teal-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
