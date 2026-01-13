import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnimationPanel from "../components/auth/AnimationPanel";
import SignupForm from "../components/auth/SignupForm";
import OtpForm from "../components/auth/OTPForm";
import { ArrowLeft } from "lucide-react";

const SignupPage = () => {
  const [otpStep, setOtpStep] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // If navigated from home CTA with state.email, go straight to OTP view
  const fromEmailCta = location.state?.fromEmailCta && location.state?.email;

  if (fromEmailCta && !otpStep && userEmail !== location.state.email) {
    setUserEmail(location.state.email);
    setOtpStep(true);
    // clear state so back button works cleanly
    navigate(location.pathname, { replace: true, state: {} });
  }

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
            <AnimationPanel page="signup" />
          </div>
          <div className="flex-1 flex items-stretch">
            <div className="w-full">
              {otpStep ? (
                <OtpForm email={userEmail} context="register" />
              ) : (
                <SignupForm
                  setOtpStep={setOtpStep}
                  setUserEmail={setUserEmail}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

