import { useRef } from 'react';
import { gsap } from 'gsap';

const TextHover = ({ text, customClass = "" }) => {
    const listRef = useRef(null);
    const tlRef = useRef(null);
    const slideHeight = 20;
    const duration = 0.3;

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
        <div className={`lg:px-8 px-4 lg:py-3 py-2 ${customClass}`}>
            <div
                className={`h-5 overflow-hidden ${customClass} text-center w-full max-w-sm mx-auto cursor-pointer`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <ul ref={listRef} className={`list-none ${customClass} lg:text-base text-sm`}>
                    <li className="v-slide leading-5">{text}</li>
                    <li className="v-slide leading-5">{text}</li>
                </ul>
            </div>
        </div>
    );
};

export default TextHover;
