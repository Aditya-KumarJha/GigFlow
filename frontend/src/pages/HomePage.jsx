import React from 'react'
import Header from '../components/layout/Header';
import HeroSection from '../components/sections/HeroSection';
import HowItWorks from '../components/layout/HowItWorks';
import Testimonials from '../components/sections/Testimonials';
import Footer from '../components/layout/Footer';

const HomePage = () => {
    return (
        <div>
            <Header />
            <HeroSection />
            <HowItWorks />
            <Testimonials />
            <Footer />
        </div>
    );
};

export default HomePage;
