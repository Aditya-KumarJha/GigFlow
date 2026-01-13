import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../utils/axios";

const SignupForm = ({ setOtpStep, setUserEmail }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
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
      email: form.email.trim() === "",
      password: "",
    };

    if (form.password.trim() === "") {
      newErrors.password = "Please fill this field";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    if (
      newErrors.firstName ||
      newErrors.lastName ||
      newErrors.email ||
      newErrors.password !== ""
    ) {
      return;
    }

    try {
      setLoading(true);
      setServerError(null);

      await api.post("/api/auth/register", form);

      setUserEmail(form.email);
      setOtpStep(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (provider === "Google") {
      window.location.href = `${baseUrl}/api/auth/google?mode=signup`;
      return;
    }

    if (provider === "GitHub") {
      window.location.href = `${baseUrl}/api/auth/github?mode=signup`;
      return;
    }

    console.log(`${provider} signup not implemented`);
  };

  const inputBaseClasses =
    "w-full px-4 py-3 rounded-lg border focus:border-teal-400 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-400 transition";

  return (
    <div className="bg-white/80 p-10 flex flex-col justify-center text-gray-900 rounded-r-2xl">
      <h2 className="text-2xl font-bold text-center mb-2">
        Create Your Account
      </h2>

      <p className="text-sm text-gray-600 text-center mb-6">
        Join AuthKit to power secure, modern authentication.
      </p>

      <SocialButtons onClick={handleSocialLogin} />

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-gray-300 flex-1" />
        <span className="text-xs text-gray-500">
          or continue with email
        </span>
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300">
          {serverError}
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
                errors.firstName ? "border-red-500" : "border-gray-300"
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
                errors.lastName ? "border-red-500" : "border-gray-300"
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
              errors.email ? "border-red-500" : "border-gray-300"
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
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-500 transition"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
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
