'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    return (
        <div className="relative w-full aspect-video md:aspect-square rounded-3xl overflow-hidden group">
            <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{ clickable: true }}
                className="w-full h-full"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full h-full">
                            <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m15 18-6-6 6-6" />
                </svg>
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>

            <style jsx global>{`
                .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.5;
                }
                .swiper-pagination-bullet-active {
                    background: #f04e30 !important;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
