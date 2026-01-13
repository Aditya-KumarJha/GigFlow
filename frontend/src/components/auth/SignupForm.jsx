import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../utils/api";

const SignupForm = ({ setOtpStep, setUserEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: location.state?.email || "",
    password: "",
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      setErrors({ ...errors, password: "" });
    } else {
      setErrors({ ...errors, [e.target.name]: false });
    }

    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      firstName: form.firstName.trim() === "",
      lastName: form.lastName.trim() === "",
      username: form.username.trim() === "",
      email: form.email.trim() === "",
      password: "",
    };

    if (form.password.trim() === "") {
      newErrors.password = "Please fill this field";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    setErrors(newErrors);

    if (
      newErrors.firstName ||
      newErrors.lastName ||
      newErrors.username ||
      newErrors.email ||
      newErrors.password !== ""
    ) {
      return;
    }

    try {
      setLoading(true);
      setServerError(null);

      const response = await api.post("/api/auth/register", {
        email: form.email,
        password: form.password,
        username: form.username,
        fullName: {
          firstName: form.firstName,
          lastName: form.lastName,
        },
        provider: "email",
      });

      setUserEmail(form.email);
      setOtpStep(true);
    } catch (err) {
      // Handle validation errors from backend
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = validationErrors.map(e => e.msg).join('. ');
        setServerError(errorMessages);
      } else {
        setServerError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (provider === "Google") {
      window.location.href = `${baseUrl}/api/auth/google/signup`;
      return;
    }

    if (provider === "GitHub") {
      window.location.href = `${baseUrl}/api/auth/github/signup`;
      return;
    }

    // provider signup not implemented
  };

  const inputBaseClasses =
    "w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-gray-900 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-cyan-400 outline-none transition";

  return (
    <div className="bg-white border border-zinc-200 p-10 flex flex-col justify-center text-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">
        Create Your Account
      </h2>

      <p className="text-sm text-gray-600 text-center mb-6">
        Join AuthKit to power secure, modern authentication.
      </p>

      <SocialButtons onClick={handleSocialLogin} />

        <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-zinc-200 flex-1" />
        <span className="text-xs text-gray-500">
          or continue with email
        </span>
        <div className="h-px bg-zinc-200 flex-1" />
      </div>

      {serverError && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-800">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-sm">{serverError}</p>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              className={`${inputBaseClasses} ${
                errors.firstName ? "border-red-500" : "border-zinc-200"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                Please fill this field
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              className={`${inputBaseClasses} ${
                errors.lastName ? "border-red-500" : "border-zinc-200"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                Please fill this field
              </p>
            )}
          </div>
        </div>

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

        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className={`${inputBaseClasses} ${
              errors.username ? "border-red-500" : "border-zinc-200"
            }`}
          />
          {errors.username && (
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
              {errors.password}
            </p>
          )}
          {!errors.password && (
            <p className="text-gray-500 text-xs mt-1">
              Must be at least 6 characters with uppercase, lowercase, and number
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-teal-400 to-cyan-500 rounded-lg text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
