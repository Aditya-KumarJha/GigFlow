import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import Lottie from "lottie-react";

import animation1 from "@/lottie/animation-1.json";
import animation2 from "@/lottie/animation-2.json";
import animation3 from "@/lottie/animation-3.json";

const AnimationPanel = ({ page = "signup" }) => {
  const animations =
    page === "login" ? [animation1, animation3] : [animation1, animation2];

  return (
    <div className="relative bg-white dark:bg-black/90 p-10 flex flex-col justify-center items-center text-center text-gray-900 dark:text-gray-100 rounded-l-2xl">
      <h1 className="text-4xl font-bold z-10 mb-4">
        {page === "login" ? "Welcome Back" : "Create your AuthKit account"}
      </h1>

      <p className="mt-2 max-w-md z-10 text-lg opacity-90 mb-6">
        {page === "login"
          ? "Access your AuthKit account securely with email or social logins."
          : "Plug-and-play authentication with email/password and social logins."}
      </p>

      <div className="hidden xl:flex gap-6 z-10">
        {animations.map((anim, i) => (
          <motion.div
            key={i}
            initial={{ y: i === 0 ? -30 : 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Tilt
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1000}
              scale={1.03}
              transitionSpeed={4000}
            >
              <Lottie
                animationData={anim}
                loop
                autoplay
                className="w-60 h-60 lg:w-72 lg:h-72 rounded-2xl"
              />
            </Tilt>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimationPanel;
