import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import Lottie from "lottie-react";

import animation1 from "../../lottie/animation-1.json";
import animation2 from "../../lottie/animation-2.json";
import animation3 from "../../lottie/animation-3.json";

const AnimationPanel = ({ page = "signup" }) => {
  const animations =
    page === "login" ? [animation1, animation3] : [animation1, animation2];

  return (
    <div className="relative bg-white p-10 flex flex-col justify-center items-center text-center text-gray-900 rounded-l-2xl">
      
      {/* Heading */}
      <h1 className="text-4xl font-extrabold z-10 mb-3 leading-tight">
        {page === "login"
          ? "Welcome Back to GigFlow"
          : "Create Your GigFlow Account"}
      </h1>

      {/* Subtext */}
      <p className="mt-1 max-w-md z-10 text-base md:text-lg opacity-80 mb-8 leading-relaxed">
        {page === "login"
          ? "Log in to manage your gigs, bids, and ongoing projects seamlessly."
          : "Join GigFlow to post gigs, place bids, and get work done efficiently."}
      </p>

      {/* Animations */}
      <div className="hidden xl:flex gap-8 z-10 mt-4">
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
                className="w-56 h-56 lg:w-64 lg:h-64 rounded-2xl"
              />
            </Tilt>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimationPanel;
