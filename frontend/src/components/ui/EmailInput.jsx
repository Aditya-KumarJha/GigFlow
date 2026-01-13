import React, { useState } from 'react';
import TextHover from './TextHover';

const EmailInput = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Add your email submission logic here
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-lg sm:max-w-lg"
    >
      <div className="flex items-center w-full border-2 border-gray-300 rounded-full overflow-hidden bg-white shadow-sm hover:border-gray-400 transform-gpu transition-transform duration-300 ease-out hover:scale-105 md:hover:scale-110 hover:shadow-2xl">
        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 text-xs sm:text-sm md:text-base
                     bg-transparent border-none focus:outline-none
                     placeholder:text-gray-400"
        />
        
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-black text-white px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 
                     text-xs sm:text-sm md:text-base font-medium
                     rounded-full m-0.5 sm:m-1 whitespace-nowrap
                     hover:bg-gray-900 active:bg-gray-950 transition-colors duration-200
                     flex items-center gap-2 overflow-hidden"
        >
          <TextHover text="Get started →" customClass="text-white !p-0 !m-0" />
        </button>
      </div>
    </form>
  );
};

export default EmailInput;
