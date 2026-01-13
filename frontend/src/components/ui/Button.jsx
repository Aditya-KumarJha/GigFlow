import React, { useRef } from 'react';
import { gsap } from 'gsap';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  type = 'button'
}) => {
  const listRef = useRef(null);
  const tlRef = useRef(null);
  const slideHeight = 20;
  const duration = 0.3;

  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-white text-black border border-black hover:bg-gray-50 focus:ring-black',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs sm:text-sm',
    sm: 'px-4 py-2 text-sm md:text-base',
    md: 'px-4 py-2.5 text-base md:text-base',
    lg: 'px-8 py-3 text-lg md:text-xl',
  };

  const handleMouseEnter = () => {
    if (tlRef.current) tlRef.current.kill();
    tlRef.current = gsap.timeline();
    tlRef.current.to(listRef.current, {
      y: -slideHeight,
      duration,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (tlRef.current) tlRef.current.kill();
    gsap.to(listRef.current, {
      y: 0,
      duration,
      ease: 'power2.out',
    });
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <div className="h-5 overflow-hidden">
        <ul ref={listRef} className="list-none">
          <li className="leading-5">{children}</li>
          <li className="leading-5">{children}</li>
        </ul>
      </div>
    </button>
  );
};

export default Button;
