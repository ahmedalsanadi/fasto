// src/components/modals/AddressModal.tsx
'use client';

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { X, MapPin, Search, Loader2 } from 'lucide-react';
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

    // Populate form logic
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
        },
        [],
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
                className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
                role="dialog"
                aria-modal="true">
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t('close')}>
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                            {isFetchingAddress
                                ? t('loading')
                                : addressToUse
                                  ? t('editAddress')
                                  : t('addNewAddress')}
                        </h2>
                        <div className="w-9" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {isFetchingAddress ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    Fetching Address details...
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                {/* Left: Form */}
                                <div className="space-y-6">
                                    {/* Map Search */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('searchAddress')}
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-primary outline-none transition-all"
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

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('country')} *
                                            </label>
                                            <select
                                                value={selectedCountry}
                                                onChange={(e) =>
                                                    setSelectedCountry(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none">
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
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('city')} *
                                            </label>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) =>
                                                    setSelectedCity(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                disabled={isLoadingCities}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none disabled:opacity-50">
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
                                            {isLoadingCities && (
                                                <Loader2 className="absolute left-10 top-[38px] w-4 h-4 animate-spin text-theme-primary" />
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                                {t('district')}
                                            </label>
                                            <select
                                                value={selectedDistrict}
                                                onChange={(e) =>
                                                    setSelectedDistrict(
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : '',
                                                    )
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none">
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

                                {/* Right: Map */}
                                <div className="flex flex-col gap-4">
                                    <div className="h-[300px] lg:h-full min-h-[400px] rounded-[32px] overflow-hidden relative border-4 border-gray-50 shadow-inner">
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
                                        <div className="absolute top-4 start-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-theme-primary" />
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-tight">
                                                Live Map Selection
                                            </span>
                                        </div>
                                    </div>
                                    {formattedAddress && (
                                        <div className="p-4 bg-theme-primary/5 rounded-2xl border border-theme-primary/10 flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
                                            <p className="text-sm text-theme-primary/80 font-medium leading-relaxed">
                                                {formattedAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 md:p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isValid || isFetchingAddress}
                            className={cn(
                                'px-10 py-3 font-black rounded-xl transition-all shadow-lg',
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
