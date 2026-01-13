import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import EmailInput from '../ui/EmailInput';
import FlipText from '../ui/FlipText';
import { Suspense } from 'react';
const ImageCursorTrail = React.lazy(() => import('../ui/ImageCursorTrail'));

const HeroSection = () => {
    // Images from public folder and subfolders for cursor trail
    const trailImages = [
      "/herosection/Image-1.png",
      "/herosection/Image-2.png",
      "/herosection/Image-3.png",
      "/herosection/Image-4.png",
      "/herosection/Image-5.png",
    ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 0.6,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-visible">
      {/* Animated image trail behind content, only on desktop/tablet */}
      <div
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <ImageCursorTrail
            items={trailImages}
            maxNumberOfImages={7}
            imgClass="w-40 h-40 opacity-70 mix-blend-multiply"
            distance={18}
            fadeAnimation={true}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Main HeroSection content, stays above animation */}
      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Desktop & Tablet View - Hidden on Mobile */}
        <div className="hidden sm:block">
          {/* Hero Heading */}
          <div className="mt-22 text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h2 className="md:pr-4 lg:pr-0 md:font-extrabold lg:font-extrabold leading-none">
              <motion.div
                className="flex justify-center gap-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl mb-1 sm:mb-2 md:mb-2"
                variants={headingVariants}
              >
                <FlipText className="text-black">BUILD</FlipText>
                <FlipText className="text-[#FF4801]">WORK</FlipText>
              </motion.div>
              <motion.div
                className="md:mt-8 lg:mt-12 flex justify-center gap-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                variants={headingVariants}
              >
                <FlipText className="text-black">THAT</FlipText>
                <FlipText className="text-[#FF4801]">MATTERS</FlipText>
              </motion.div>
            </h2>
          </div>

          {/* Email Input Section */}
          <motion.div 
            className="flex justify-center mb-12 md:mb-16"
            variants={inputVariants}
          >
            <EmailInput />
          </motion.div>

          {/* Partner Logos */}
          <motion.div 
            className="flex items-center justify-center gap-12 md:gap-16 lg:gap-20 xl:gap-24"
            variants={containerVariants}
          >
            <motion.img 
              src="/logos/fiverr.png" 
              alt="Fiverr" 
              className="h-8 md:h-10 lg:h-12 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
              whileHover={{ scale: 1.1, opacity: 0.8 }}
            />
            <motion.img 
              src="/logos/indeed.png" 
              alt="Indeed" 
              className="h-8 md:h-10 lg:h-12 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
              whileHover={{ scale: 1.1, opacity: 0.8 }}
            />
            <motion.img 
              src="/logos/linkedin.avif" 
              alt="LinkedIn" 
              className="h-8 md:h-10 lg:h-12 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
              whileHover={{ scale: 1.1, opacity: 0.8 }}
            />
            <motion.img 
              src="/logos/toptal.png" 
              alt="Toptal" 
              className="h-8 md:h-10 lg:h-12 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
              whileHover={{ scale: 1.1, opacity: 0.8 }}
            />
            <motion.img 
              src="/logos/upwork.png" 
              alt="Upwork" 
              className="h-8 md:h-10 lg:h-12 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
              whileHover={{ scale: 1.1, opacity: 0.8 }}
            />
          </motion.div>
        </div>

        {/* Mobile View - Hidden on Desktop & Tablet */}
        <div className="block sm:hidden">
          {/* Hero Heading - Mobile */}
          <div className="mt-15 text-center mb-8">
            <h2 className="-tracking-widest font-extrabold leading-none">
              <motion.div
                className="flex justify-center gap-3 text-5xl mb-1"
                variants={headingVariants}
              >
                <FlipText className="text-black mb-2">BUILD</FlipText>
              </motion.div>
              <motion.div
                className="flex justify-center gap-3 text-5xl mb-3"
                variants={headingVariants}
              >
                <FlipText className="mt-1 mb-1 text-[#FF4801]">WORK</FlipText>
                <FlipText className="mt-1 mb-1 text-black">THAT</FlipText>
              </motion.div>
              <motion.div
                className="flex justify-center gap-3 text-5xl"
                variants={headingVariants}
              >
                <FlipText className="text-[#FF4801]">MATTERS</FlipText>
              </motion.div>
            </h2>
          </div>

          {/* Email Input Section - Mobile */}
          <motion.div 
            className="flex justify-center px-2 mb-10"
            variants={inputVariants}
          >
            <EmailInput />
          </motion.div>

          {/* Partner Logos - Mobile */}
          <motion.div 
            className="flex items-center justify-center gap-6"
            variants={containerVariants}
          >
            <motion.img 
              src="/logos/fiverr.png" 
              alt="Fiverr" 
              className="h-7 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
            />
            <motion.img 
              src="/logos/indeed.png" 
              alt="Indeed" 
              className="h-7 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
            />
            <motion.img 
              src="/logos/linkedin.avif" 
              alt="LinkedIn" 
              className="h-7 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
            />
            <motion.img 
              src="/logos/toptal.png" 
              alt="Toptal" 
              className="h-7 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
            />
            <motion.img 
              src="/logos/upwork.png" 
              alt="Upwork" 
              className="h-7 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
              variants={logoVariants}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
