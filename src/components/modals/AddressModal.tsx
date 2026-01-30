// src/components/modals/AddressModal.tsx
'use client';

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { X, MapPin, Search, Loader2, ChevronDown, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DEFAULT_MAP_CENTER } from '@/lib/branches';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { Address, AddressFormSubmitPayload } from '@/types/address';
import { toast } from 'sonner';
import {
    useAddress,
    useCountries,
    useCities,
    useDistricts,
} from '@/hooks/useAddresses';
import { useAuthStore } from '@/store/useAuthStore';

// Lazy load map to avoid SSR issues
const AddressMap = dynamic(() => import('./AddressMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="text-sm text-gray-400">Loading map...</div>
        </div>
    ),
});

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: AddressFormSubmitPayload) => void;
    initialAddress?: Address | null;
    addressId?: number | null;
}

const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialAddress: initialAddressProp,
    addressId,
}) => {
    const t = useTranslations('Address');
    const { isAuthenticated } = useAuthStore();

    // Core Display Fields
    const [addressName, setAddressName] = useState('');
    const [addressNotes, setAddressNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<
        [number, number] | null
    >(DEFAULT_MAP_CENTER);
    const [formattedAddress, setFormattedAddress] = useState('');

    // API Structured Fields
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<number | ''>('');
    const [selectedCity, setSelectedCity] = useState<number | ''>('');
    const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
    const [street, setStreet] = useState('');
    const [building, setBuilding] = useState('');
    const [unit, setUnit] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [additionalNumber, setAdditionalNumber] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // Pending city/district: when editing, we set country first then need to wait for
    // cities API before we can set selectedCity (same for district). We store the
    // desired id in pending* and apply it once the list is loaded (see applyPendingWhenOptionsReady below).
    const [pendingCity, setPendingCity] = useState<number | ''>('');
    const [pendingDistrict, setPendingDistrict] = useState<number | ''>('');

    // Fetch address data if ID is provided (Authenticated Edit)
    const { data: fetchedAddress, isLoading: isFetchingAddress } = useAddress(
        isAuthenticated && addressId ? addressId : null,
    );

    // Determine which address object to use (prop or fetched)
    const addressToUse = useMemo(
        () => fetchedAddress || initialAddressProp,
        [fetchedAddress, initialAddressProp],
    );

    // React Query for location data
    const { data: countries = [] } = useCountries();
    const { data: cities = [], isLoading: isLoadingCities } = useCities(
        Number(selectedCountry) || null,
    );
    const { data: districts = [] } = useDistricts(Number(selectedCity) || null);

    const modalRef = useRef<HTMLDivElement>(null);

    // Populate form logic. When editing, clear city/district selection first so we don't show
    // wrong values from a previous form; pendingCity/pendingDistrict will be applied when lists load.
    const populateForm = useCallback(
        (addr: Address | null | undefined) => {
            if (addr) {
                setAddressName(addr.label || addr.name || '');
                setRecipientName(addr.recipient_name || '');
                setPhone(addr.phone || '');
                setAddressNotes(addr.description || addr.notes || '');
                setSelectedCountry(
                    addr.country_id ? Number(addr.country_id) : '',
                );
                setSelectedCity('');
                setSelectedDistrict('');
                setPendingCity(addr.city_id ? Number(addr.city_id) : '');
                setPendingDistrict(
                    addr.district_id ? Number(addr.district_id) : '',
                );
                setStreet(addr.street || '');
                setBuilding(addr.building || addr.building_number || '');
                setUnit(addr.unit || addr.unit_number || '');
                setPostalCode(addr.postal_code || '');
                setAdditionalNumber(addr.additional_number || '');
                setIsDefault(addr.is_default || false);

                if (addr.latitude && addr.longitude) {
                    setSelectedLocation([
                        Number(addr.latitude),
                        Number(addr.longitude),
                    ]);
                } else {
                    setSelectedLocation(DEFAULT_MAP_CENTER);
                }
                setFormattedAddress(addr.formatted || '');
            } else {
                // Reset for New Address
                setAddressName('');
                setRecipientName('');
                setPhone('');
                setAddressNotes('');
                setSelectedCountry(countries[0]?.id || '');
                setSelectedCity('');
                setSelectedDistrict('');
                setStreet('');
                setBuilding('');
                setUnit('');
                setPostalCode('');
                setAdditionalNumber('');
                setIsDefault(false);
                setSelectedLocation(DEFAULT_MAP_CENTER);
                setFormattedAddress('');
                setSearchQuery('');
            }
        },
        [countries],
    );

    // applyPendingWhenOptionsReady: once cities/districts load, set selected from pending if the option exists.
    useEffect(() => {
        if (!isLoadingCities && cities.length > 0 && pendingCity) {
            if (cities.some((c) => c.id === pendingCity)) {
                setSelectedCity(pendingCity);
                setPendingCity('');
            }
        }
    }, [cities, isLoadingCities, pendingCity]);

    useEffect(() => {
        if (districts.length > 0 && pendingDistrict) {
            if (districts.some((d) => d.id === pendingDistrict)) {
                setSelectedDistrict(pendingDistrict);
                setPendingDistrict('');
            }
        }
    }, [districts, pendingDistrict]);

    // Handle initial load and address changes
    useEffect(() => {
        if (isOpen && !isFetchingAddress) {
            populateForm(addressToUse);
        }
    }, [isOpen, addressToUse, isFetchingAddress, populateForm]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSave = () => {
        if (!isValid) return;

        const addressData = {
            id: addressToUse?.id,
            label: addressName.trim(),
            recipient_name: recipientName.trim(),
            phone: phone.trim(),
            country_id: Number(selectedCountry),
            city_id: Number(selectedCity),
            district_id: selectedDistrict ? Number(selectedDistrict) : null,
            street: street.trim(),
            building: building.trim(),
            unit: unit.trim(),
            postal_code: postalCode.trim(),
            additional_number: additionalNumber.trim(),
            description: addressNotes.trim(),
            is_default: isDefault,
            name: addressName.trim(),
            formatted: formattedAddress || street.trim(),
            notes: addressNotes.trim(),
            latitude: selectedLocation?.[0],
            longitude: selectedLocation?.[1],
        };

        onSave(addressData);
    };

    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setSelectedLocation(location);
            setFormattedAddress(formatted);
            toast.success(t('locationSelected'), { duration: 2000 });
        },
        [t],
    );

    const isValid =
        addressName.trim() &&
        phone.trim() &&
        selectedCountry &&
        selectedCity &&
        street.trim();

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={modalRef}
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-5"
                role="dialog"
                aria-modal="true">
                <div
                    className={cn(
                        'bg-white shadow-2xl w-full overflow-hidden flex flex-col',
                        'max-h-[88vh] sm:max-h-[90vh]',
                        'rounded-xl sm:rounded-2xl md:rounded-3xl',
                        'max-w-6xl',
                    )}
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-100 shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={t('close')}>
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                            {isFetchingAddress
                                ? t('fetchingAddress')
                                : addressToUse
                                  ? t('editAddress')
                                  : t('addNewAddress')}
                        </h2>
                        <div className="w-9 min-w-[44px]" />
                    </div>

                    {/* Content - fixed min-height so modal doesn't jump when switching from skeleton to form */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 min-h-[40vh] sm:min-h-[480px]">
                        {isFetchingAddress ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 h-full">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gray-100 animate-pulse" />
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'h-12 sm:h-14 rounded-lg sm:rounded-xl bg-gray-100 animate-pulse',
                                                    i === 1 || i === 2
                                                        ? 'sm:col-span-2'
                                                        : '',
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div className="h-[220px] sm:h-[320px] lg:min-h-[400px] rounded-lg sm:rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                                    <div className="h-16 sm:h-20 rounded-lg sm:rounded-xl bg-gray-100/80 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                {/* Left: Form - on mobile appears below map (order-2) */}
                                <div className="space-y-4 sm:space-y-6 order-2 lg:order-0">
                                    {/* Selected location feedback - visible so user knows map selection worked */}
                                    {formattedAddress && (
                                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-theme-primary/10 rounded-lg sm:rounded-xl border border-theme-primary/20">
                                            <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check
                                                    className="w-4 h-4 text-theme-primary"
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-theme-primary/80 mb-0.5">
                                                    {t('locationSelected')}
                                                </p>
                                                <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2">
                                                    {formattedAddress}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Map Search */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('searchAddress')}
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'searchPlaceholder',
                                                )}
                                                className="w-full pr-10 pl-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-primary outline-none transition-all text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('addressName')} *
                                            </label>
                                            <input
                                                type="text"
                                                value={addressName}
                                                onChange={(e) =>
                                                    setAddressName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'addressNamePlaceholder',
                                                )}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none transition-all font-semibold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('recipientName')}
                                            </label>
                                            <input
                                                type="text"
                                                value={recipientName}
                                                onChange={(e) =>
                                                    setRecipientName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('phone')} *
                                            </label>
                                            <input
                                                type="tel"
                                                dir="ltr"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                placeholder="05xxxx..."
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-bold"
                                            />
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('country')} *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={
                                                        selectedCountry === ''
                                                            ? ''
                                                            : selectedCountry
                                                    }
                                                    onChange={(e) => {
                                                        const v =
                                                            e.target.value;
                                                        setSelectedCountry(
                                                            v ? Number(v) : '',
                                                        );
                                                    }}
                                                    className="w-full ps-4 pe-10 py-3 sm:py-3.5 min-h-[48px] rounded-xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none font-semibold appearance-none cursor-pointer text-base text-gray-900">
                                                    <option value="">
                                                        {t('selectCountry')}
                                                    </option>
                                                    {countries.map((c) => (
                                                        <option
                                                            key={c.id}
                                                            value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none rtl:rotate-180" />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('city')} *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={
                                                        selectedCity === ''
                                                            ? ''
                                                            : selectedCity
                                                    }
                                                    onChange={(e) => {
                                                        const v =
                                                            e.target.value;
                                                        setSelectedCity(
                                                            v ? Number(v) : '',
                                                        );
                                                    }}
                                                    disabled={isLoadingCities}
                                                    className="w-full ps-4 pe-10 py-3 sm:py-3.5 min-h-[48px] rounded-xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none font-semibold appearance-none disabled:opacity-50 cursor-pointer text-base text-gray-900">
                                                    <option value="">
                                                        {t('selectCity')}
                                                    </option>
                                                    {cities.map((c) => (
                                                        <option
                                                            key={c.id}
                                                            value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none rtl:rotate-180" />
                                                {isLoadingCities && (
                                                    <Loader2 className="absolute end-10 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-theme-primary" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 relative">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('district')}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={
                                                        selectedDistrict === ''
                                                            ? ''
                                                            : selectedDistrict
                                                    }
                                                    onChange={(e) => {
                                                        const v =
                                                            e.target.value;
                                                        setSelectedDistrict(
                                                            v ? Number(v) : '',
                                                        );
                                                    }}
                                                    className="w-full ps-4 pe-10 py-3 sm:py-3.5 min-h-[48px] rounded-xl bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none font-semibold appearance-none cursor-pointer text-base text-gray-900">
                                                    <option value="">
                                                        {t('selectDistrict')}
                                                    </option>
                                                    {districts.map((d) => (
                                                        <option
                                                            key={d.id}
                                                            value={d.id}>
                                                            {d.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none rtl:rotate-180" />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('street')} *
                                            </label>
                                            <input
                                                type="text"
                                                value={street}
                                                onChange={(e) =>
                                                    setStreet(e.target.value)
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                    {t('building')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={building}
                                                    onChange={(e) =>
                                                        setBuilding(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                    {t('unit')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={unit}
                                                    onChange={(e) =>
                                                        setUnit(e.target.value)
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                    {t('postalCode')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={postalCode}
                                                    onChange={(e) =>
                                                        setPostalCode(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                    {t('additionalNumber')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={additionalNumber}
                                                    onChange={(e) =>
                                                        setAdditionalNumber(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('addressNotes')}
                                            </label>
                                            <textarea
                                                value={addressNotes}
                                                onChange={(e) =>
                                                    setAddressNotes(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'addressNotesPlaceholder',
                                                )}
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none resize-none"
                                            />
                                        </div>

                                        <div className="sm:col-span-2 flex items-center gap-3 py-2">
                                            <input
                                                type="checkbox"
                                                id="set-default"
                                                checked={isDefault}
                                                onChange={(e) =>
                                                    setIsDefault(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="w-5 h-5 rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                                            />
                                            <label
                                                htmlFor="set-default"
                                                className="text-sm font-bold text-gray-700 cursor-pointer">
                                                {t('setDefault')}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Map - fixed min height so layout doesn't jump */}
                                <div className="flex flex-col gap-4 order-first lg:order-0">
                                    <div className="h-[220px] sm:h-[280px] lg:h-full lg:min-h-[400px] rounded-lg sm:rounded-2xl md:rounded-3xl overflow-hidden relative border-2 border-gray-100 shadow-inner">
                                        <AddressMap
                                            center={
                                                selectedLocation ||
                                                DEFAULT_MAP_CENTER
                                            }
                                            onLocationSelect={
                                                handleLocationSelect
                                            }
                                            searchQuery={searchQuery}
                                        />
                                        <div className="absolute top-3 start-3 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">
                                                {t('locationSelected')}
                                            </span>
                                        </div>
                                    </div>
                                    {formattedAddress && (
                                        <div className="p-3 sm:p-4 bg-theme-primary/5 rounded-lg sm:rounded-xl border border-theme-primary/10 flex items-start gap-2 sm:gap-3">
                                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary shrink-0 mt-0.5" />
                                            <p className="text-xs sm:text-sm text-theme-primary/90 font-medium leading-snug line-clamp-2">
                                                {formattedAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - touch-friendly on mobile */}
                    <div className="p-4 sm:p-5 md:p-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-[48px] px-6 py-3 text-gray-500 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors touch-manipulation">
                            {t('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isValid || isFetchingAddress}
                            className={cn(
                                'min-h-[48px] px-8 sm:px-10 py-3 font-black rounded-lg sm:rounded-xl transition-all shadow-lg touch-manipulation',
                                isValid && !isFetchingAddress
                                    ? 'bg-theme-primary text-white hover:brightness-95 shadow-theme-primary/20 active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-none',
                            )}>
                            {addressToUse ? t('save') : t('addNew')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressModal;
