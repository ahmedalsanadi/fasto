'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { MoveRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
    {
        id: 1,
        subtitle: 'Super Delicious',
        title: 'BURGER',
        deal: "Today's Best Deal",
        discount: '50% OFF',
        image: '/images/images/burger.webp',
        bgColor: 'bg-[#212529]', // Dark charcoal background
    },
    {
        id: 2,
        subtitle: 'Special Offer',
        title: 'PIZZA',
        deal: 'Weekend Special',
        discount: '30% OFF',
        image: '/images/images/pizza-hero.webp', // Reusing for now or could be another SVG
        bgColor: 'bg-[#1a1a1a]',
    },
];

const HeroSlider = () => {
    return (
        <section className="container mx-auto px-0 md:px-4  mt-20 md:mt-6">
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl group/slider">
                <Swiper
                    modules={[Pagination, Autoplay, EffectFade]}
                    pagination={{
                        clickable: true,
                        renderBullet: (index, className) => {
                            return `<span class="${className} bg-white! opacity-100! w-2! h-2!"></span>`;
                        },
                    }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    effect="fade"
                    loop={true}
                    className="hero-swiper h-[550px] sm:h-[600px] md:h-[500px] lg:h-[600px]">
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div
                                className={`relative w-full h-full ${slide.bgColor} flex items-center overflow-hidden`}>
                                {/* Background Gradient Overlay */}
                                <div className="absolute inset-0 bg-linear-to-r from-black/60 md:from-black/40 to-transparent z-1"></div>

                                {/* Decorative brush strokes (simplified with SVGs or CSS) */}
                                <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-20 transform -translate-x-1/4 -translate-y-1/4 z-1">
                                    <svg
                                        viewBox="0 0 200 200"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-full text-theme-primary">
                                        <path
                                            d="M0 0C50 20 80 50 100 100C120 150 150 180 200 200"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-20 transform translate-x-1/4 translate-y-1/4 z-1">
                                    <svg
                                        viewBox="0 0 200 200"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-full text-theme-primary">
                                        <path
                                            d="M0 200C50 180 80 150 100 100C120 50 150 20 200 0"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>

                                <div className="container mx-auto px-6 md:px-8 lg:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-4 md:gap-8 h-full relative z-10">
                                    {/* Content Side */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1 md:space-y-4 pt-12 md:pt-0">
                                        <span className="text-theme-primary text-lg md:text-2xl lg:text-3xl font-semibold tracking-tight uppercase">
                                            {slide.subtitle}
                                        </span>
                                        <h1 className="text-white text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter drop-shadow-lg">
                                            {slide.title}
                                        </h1>
                                        <p className="text-theme-primary text-xl md:text-3xl lg:text-4xl italic font-serif leading-tight">
                                            {slide.deal}
                                        </p>

                                        <div className="pt-4 md:pt-8">
                                            <button className="bg-theme-primary hover:bg-white hover:text-black text-white px-8 py-3 md:px-10 md:py-4 rounded-full flex items-center gap-3 md:gap-4 transition-all duration-300 transform hover:scale-105 active:scale-95 group cursor-pointer shadow-lg shadow-theme-primary/20">
                                                <span className="font-bold tracking-wider text-base md:text-lg">
                                                    ORDER NOW
                                                </span>
                                                <div className="bg-white/20 p-1 md:p-1.5 rounded-full group-hover:bg-black/10 transition-colors">
                                                    <MoveRight className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Side */}
                                    <div className="relative h-full flex items-center justify-center pb-8 md:pb-0">
                                        {/* 50% Off Badge */}
                                        <div className="absolute top-0 right-0 md:top-10 md:right-0 lg:right-10 z-20 animate-bounce-slow">
                                            <div className="bg-theme-primary w-24 h-24 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-white border-4 border-white/30 shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                                                <span className="text-2xl md:text-5xl font-black leading-none">
                                                    {
                                                        slide.discount.split(
                                                            '%',
                                                        )[0]
                                                    }
                                                    %
                                                </span>
                                                <span className="text-xs md:text-xl font-bold uppercase tracking-widest">
                                                    OFF
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[450px] lg:h-[550px] flex items-center justify-center">
                                            <Image
                                                src={slide.image}
                                                alt={slide.title}
                                                fill
                                                className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] md:drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-700"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info (Contact & Website) */}
                                <div className="absolute bottom-8 right-10 lg:right-20 text-right hidden md:block z-10">
                                    <p className="text-white font-bold text-2xl tracking-tighter">
                                        +966-555-555-555
                                    </p>
                                    <p className="text-white/50 text-xs tracking-[0.3em] uppercase mt-1">
                                        www.Fitoro.com
                                    </p>
                                </div>

                                {/* Logo/Brand at top left */}
                                <div className="absolute top-6 left-6 md:top-10 md:left-20 z-10">
                                    <span className="text-white text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 opacity-90">
                                        <span className="bg-theme-primary w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm text-white shadow-lg">
                                            T
                                        </span>
                                        HERE
                                    </span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default HeroSlider;
