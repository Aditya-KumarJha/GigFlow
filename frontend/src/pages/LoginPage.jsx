import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AnimationPanel from "../components/auth/AnimationPanel";
import LoginForm from "../components/auth/LoginForm";
import ForgotPassword from "../components/auth/ForgotPassword";
import OtpForm from "../components/auth/OTPForm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [otpStep, setOtpStep] = useState(false);
  const [forgotStep, setForgotStep] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If we land on /login?reset=1 ensure the login form is shown
    if (searchParams.get("reset")) {
      setForgotStep(false);
      setOtpStep(false);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-white pt-20 pb-16 px-4">
      <div className="w-4/5 max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute left-6 top-6 z-50 flex items-center gap-2 text-sm text-zinc-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="flex flex-col xl:flex-row items-stretch gap-10 xl:gap-16">
          <div className="flex-1 flex items-stretch">
            <AnimationPanel page="login" />
          </div>
          <div className="flex-1 flex items-stretch">
            <div className="w-full">
              {forgotStep ? (
                <ForgotPassword
                  email={userEmail}
                  setEmail={setUserEmail}
                  onBack={() => setForgotStep(false)}
                />
              ) : otpStep ? (
                <OtpForm email={userEmail} context="login" />
              ) : (
                <LoginForm
                  setOtpStep={setOtpStep}
                  setUserEmail={setUserEmail}
                  setForgotStep={setForgotStep}
                  errorMessage={errorMessage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

