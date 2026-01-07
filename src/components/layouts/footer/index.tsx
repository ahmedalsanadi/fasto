import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

// Import sub-components
import FooterColumn from './footer-column';
import AppBadge from './app-badge';
import PaymentBadge from './payment-badge';

// Import data
import {
    footerSections,
    appBadges,
    trustBadges,
    paymentBadges,
    partnerBadges,
    socialLinks,
} from './footer-data';
import { useTranslations } from 'next-intl';

const Footer = () => {
    const t = useTranslations('Footer');

    return (
        <footer className="w-full flex flex-col">
            {/* Top Section: Links & Apps */}
            <div className="bg-[#FAF4F0] py-12 md:py-18 px-4">
                <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
                    {/* Logo & Info */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start mb-6">
                            <Image
                                src="/images/logo/fasto-logo.svg"
                                alt="Fasto Logo"
                                width={90}
                                height={70}
                                className="object-contain"
                            />
                            <h3 className="text-2xl text-libero-red font-semibold">
                                Fasto
                            </h3>
                        </div>
                        <p className="text-gray-600 text-[14px] leading-relaxed font-medium max-w-sm">
                            {t('description')}
                        </p>
                    </div>

                    {/* Columns Order based on image */}
                    {footerSections.map((section, idx) => (
                        <div key={idx} className="text-center lg:text-left">
                            <FooterColumn
                                titleKey={section.titleKey}
                                links={section.links}
                            />
                        </div>
                    ))}

                    {/* Contact Us Column */}
                    <div className="text-center lg:text-left">
                        <h4 className="font-black text-gray-900 mb-6 lg:mb-8 text-xl">
                            {t('contact')}
                        </h4>
                        <ul className="space-y-4 lg:space-y-6">
                            <li className="flex items-center gap-2 text-gray-600 font-bold text-md justify-center lg:justify-start">
                                <Phone
                                    className="w-5 h-5 text-[#B44734]"
                                    strokeWidth={2.5}
                                />
                                <span>+966 55 123 9876</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600 font-bold text-md justify-center lg:justify-start">
                                <Mail
                                    className="w-5 h-5 text-[#B44734]"
                                    strokeWidth={2.5}
                                />
                                <span>contact@Fasto.sa</span>
                            </li>
                        </ul>
                    </div>

                    {/* Apps Column  */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <h4 className="font-black text-gray-900 mb-6 lg:mb-8 text-xl">
                            {t('downloadApp')}
                        </h4>
                        <div className="flex flex-row lg:flex-col gap-4 justify-center">
                            {appBadges.map((badge, idx) => (
                                <AppBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    href={badge.href}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Partners & Payment Strip */}
            <div className="bg-libero-red py-8 lg:py-4 border-b border-[#FFB800]/30 relative">
                <div className="container mx-auto px-4 ">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                        {/* Section: Delivery & Partners */}
                        <div className="flex flex-wrap justify-center items-center gap-4">
                            {partnerBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    width={90}
                                    height={45}
                                    className="h-8 lg:h-10 w-auto"
                                />
                            ))}
                        </div>

                        {/* Middle Section: Payment Methods */}
                        <div className="flex flex-wrap items-center justify-center gap-4 lg:flex-1 w-full max-w-3xl">
                            {paymentBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                />
                            ))}
                        </div>

                        {/* Section: Trust Badges */}
                        <div className="flex flex-wrap justify-center items-center gap-4">
                            {trustBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    width={90}
                                    height={45}
                                    className="h-8 lg:h-10 w-auto"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Socials, Powered By & Copyright */}
            <div className="bg-libero-red p-6 lg:p-4">
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
                    {/* Copyright Left */}
                    <div className="text-white/90 text-sm font-bold text-center lg:text-left order-3 lg:order-1">
                        {t('rights')}
                    </div>

                    {/* Powered By Center */}
                    <div className="flex items-center gap-2 order-2 lg:order-2">
                        <span className="text-white/90 text-[15px] font-bold">
                            {t('poweredBy')}
                        </span>
                        <Image
                            src="/images/logo/libero-copywrite.svg"
                            width={90}
                            height={30}
                            alt="Libro"
                            className="h-7 w-auto brightness-0 invert"
                        />
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-6 lg:gap-4 order-1 lg:order-3">
                        {socialLinks.map((social, idx) => (
                            <Link
                                key={idx}
                                href={social.href}
                                className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm scale-110 lg:scale-100"
                            >
                                <social.icon className="w-5 h-5" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
