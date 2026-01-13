import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import OtpForm from "./OTPForm";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = ({ email, setEmail, onBack }) => {
  const [step, setStep] = useState("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post("/api/auth/forgot-password", { email });
      setStep("verify");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post("/api/auth/reset-password", {
        email,
        newPassword: password,
      });

      setSuccess("Your password was reset successfully");

      setTimeout(() => navigate("/login?reset=1"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  return (
    <div className="bg-white border border-zinc-200 backdrop-blur-md p-10 flex flex-col justify-center text-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>

      {error && (
        <div className="mb-3 p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 rounded-md bg-green-100 text-green-700 text-sm border border-green-300 text-center">
          {success}
        </div>
      )}

      {step === "email" && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleSendOtp)}
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-gray-900 placeholder-gray-400 mb-4"
          />

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-3 bg-linear-to-r from-teal-400 to-cyan-500 rounded-lg text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      )}

      {step === "verify" && (
        <OtpForm
          email={email}
          context="forgot"
          onVerified={() => setStep("reset")}
        />
      )}

      {step === "reset" && (
        <>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleResetPassword)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-gray-900 placeholder-gray-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <p className="text-gray-500 text-xs mb-4">
            Must be at least 6 characters with uppercase, lowercase, and number
          </p>

          <div className="relative mb-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleResetPassword)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-gray-900 placeholder-gray-400"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500 mb-3">
              Passwords do not match
            </p>
          )}

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full py-3 bg-linear-to-r from-teal-400 to-cyan-500 rounded-lg text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </>
      )}

      <button
        onClick={onBack}
        className="mt-6 text-sm text-teal-500 dark:text-cyan-400 hover:underline"
      >
        Back to Login
      </button>
    </div>
  );
};

export default ForgotPassword;
