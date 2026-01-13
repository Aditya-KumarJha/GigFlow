import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../utils/axios";

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

  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setServerError(error);
      searchParams.delete("error");
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

      await api.post("/api/auth/login", form);

      setUserEmail(form.email);
      setOtpStep(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  

  const handleSocialLogin = (provider) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (provider === "Google") {
      window.location.href = `${baseUrl}/api/auth/google?mode=login`;
      return;
    }

    if (provider === "GitHub") {
      window.location.href = `${baseUrl}/api/auth/github?mode=login`;
      return;
    }
    console.log(`${provider} login not implemented`);
  };

  const inputBaseClasses =
    "w-full px-4 py-3 rounded-lg border focus:border-teal-400 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-400 dark:placeholder-gray-500 transition";

  return (
    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md p-10 flex flex-col justify-center text-gray-900 dark:text-white rounded-r-2xl">
      <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-8">
        Enter your credentials below to access your account.
      </p>

      <SocialButtons onClick={handleSocialLogin} />

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          or continue with email
        </span>
        <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1" />
      </div>

      {(errorMessage || serverError) && (
        <div className="mb-3 p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300 text-center">
          {errorMessage || serverError}
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
              errors.email
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
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
              errors.password
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-500 transition"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
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
