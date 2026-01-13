import React from 'react'
import Header from '../components/layout/Header';
import HeroSection from '../components/sections/HeroSection';
import HowItWorks from '../components/layout/HowItWorks';

const HomePage = () => {
    return (
        <div>
            <Header />
            <HeroSection />
            <HowItWorks />
        </div>
    );
};

export default HomePage;
