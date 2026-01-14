import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useDispatch } from 'react-redux'
import { setAuthenticated, verifySession } from '../../store/authSlice'
import { toast } from 'react-toastify'

const OtpForm = ({ email, context, onVerified }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 10 * 60 * 1000)
  );
  const [remainingTime, setRemainingTime] = useState(10 * 60);

  /* Resend cooldown timer */
  useEffect(() => {
    let interval;
    if (resendDisabled) {
      interval = window.setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendDisabled]);

  /* OTP expiry countdown */
  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );
      setRemainingTime(diff);

      if (diff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const verifyOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setServerError("Please enter all 6 digits.");
      return;
    }

    if (remainingTime <= 0) {
      setServerError("OTP has expired. Please resend.");
      return;
    }

    try {
      setLoading(true);
      setServerError(null);

      let endpoint = "/api/auth/verify-register-otp";

      if (context === "login") {
        endpoint = "/api/auth/verify-login-otp";
      } else if (context === "forgot") {
        endpoint = "/api/auth/verify-forgot-password-otp";
      }

      const res = await api.post(endpoint, {
        email,
        otp: otpCode,
      });

      if (context === "forgot") {
        if (onVerified) {
          onVerified(res.data);
        }
      } else {
        dispatch(setAuthenticated());
        await dispatch(verifySession());
        
        // Show appropriate toast after successful register or login
        if (context === 'register') {
          toast.success('Signup successful! Welcome to GigFlow 🎉');
        } else if (context === 'login') {
          toast.success('Login successful! Welcome back 👋');
        }

        // After successful register or login, redirect to browse gigs
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val && otp[index] === "") return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setServerError(null);
    setResendMessage(null);

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    const target = e.target;

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0 && target.selectionStart === 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 5 &&
      target.selectionStart === target.value.length
    ) {
      otpRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (otp.join("").length === 6 && remainingTime > 0 && !loading) {
        verifyOtp();
      }
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setTimer(30);
    setServerError(null);
    setResendMessage(null);

    try {
      if (context === "forgot") {
        await api.post("/api/auth/forgot-password", { email });
      } else {
        await api.post("/api/auth/resend-otp", { email });
      }

      setResendMessage("OTP has been resent to your email.");
      setExpiresAt(new Date(Date.now() + 10 * 60 * 1000));
      setRemainingTime(10 * 60);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to resend OTP."
      );
      setResendDisabled(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white border border-zinc-200 backdrop-blur-md p-10 flex flex-col justify-center text-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Verify OTP</h2>

      <p className="text-sm text-center text-gray-600 mb-6">
        Enter the 6-digit OTP sent to <strong>{email}</strong>
      </p>

        {remainingTime > 0 ? (
        <p className="text-xs text-center text-gray-500 mb-4">
          OTP is valid for{" "}
          <span className="font-semibold">{formatTime(remainingTime)}</span>
        </p>
      ) : (
        <p className="text-xs text-center text-red-500 mb-4">
          OTP has expired. Please resend.
        </p>
      )}

      {serverError && (
        <div className="mb-3 p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-300 text-center">
          {serverError}
        </div>
      )}

      {resendMessage && (
        <div className="mb-3 p-3 rounded-md bg-green-100 text-green-700 text-sm border border-green-300 text-center">
          {resendMessage}
        </div>
      )}

      <form
        className="space-y-4 flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (otp.join("").length === 6 && remainingTime > 0 && !loading) {
            verifyOtp();
          }
        }}
      >
        <div className="flex gap-3">
          {otp.map((val, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(el) => (otpRefs.current[i] = el)}
              className="w-14 h-14 text-center text-2xl rounded-lg border border-zinc-200 focus:border-teal-400 focus:ring-2 focus:ring-cyan-400 bg-white outline-none shadow hover:scale-105 transition active:scale-95"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6 || remainingTime <= 0}
          className="mt-6 px-6 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-cyan-500 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled}
          className="text-sm text-teal-500 hover:text-cyan-500 mt-4 disabled:opacity-50"
        >
          {resendDisabled
            ? `Resend OTP in ${timer}s`
            : "Didn’t receive? Resend OTP"}
        </button>
      </form>
    </div>
  );
};

export default OtpForm;
