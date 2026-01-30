// src/components/modals/AddressModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DeliveryAddress } from '@/store/useOrderStore';
import { DEFAULT_MAP_CENTER } from '@/lib/branches';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { storeService } from '@/services/store-service';
import { Country, City, District, Address } from '@/types/address';
import { toast } from 'sonner';

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
    onSave: (address: any) => void; // Using any for now because current implementation produces a hybrid object
    initialAddress?: Address | null;
}

const AddressModal: React.FC<AddressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialAddress,
}) => {
    const t = useTranslations('Address');

    // Core Display Fields
    const [addressName, setAddressName] = useState('');
    const [addressNotes, setAddressNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<
        [number, number] | null
    >(
        initialAddress?.latitude && initialAddress?.longitude
            ? [
                  Number(initialAddress.latitude),
                  Number(initialAddress.longitude),
              ]
            : DEFAULT_MAP_CENTER,
    );
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

    // Filter Data
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Initial Fetch: Countries
    useEffect(() => {
        if (isOpen) {
            const fetchCountries = async () => {
                try {
                    console.log('[AddressModal] Fetching countries...');
                    const data = await storeService.getCountries();
                    console.log('[AddressModal] Countries response:', data);
                    setCountries(Array.isArray(data) ? data : []);
                    // Default to first country if none selected
                    if (
                        data &&
                        Array.isArray(data) &&
                        data.length > 0 &&
                        !selectedCountry
                    ) {
                        console.log(
                            '[AddressModal] Setting default country:',
                            data[0].id,
                        );
                        setSelectedCountry(data[0].id);
                    }
                } catch (error) {
                    console.error('Failed to fetch countries:', error);
                }
            };
            fetchCountries();
        }
    }, [isOpen]);

    // Fetch Cities when Country changes
    useEffect(() => {
        if (selectedCountry) {
            const fetchCities = async () => {
                setIsLoadingLocations(true);
                try {
                    console.log(
                        `[AddressModal] Fetching cities for country: ${selectedCountry}...`,
                    );
                    const data = await storeService.getCities(
                        Number(selectedCountry),
                    );
                    console.log('[AddressModal] Cities response:', data);
                    const citiesArray = Array.isArray(data) ? data : [];
                    setCities(citiesArray);
                    if (
                        initialAddress?.city_id &&
                        citiesArray.some((c) => c.id === initialAddress.city_id)
                    ) {
                        setSelectedCity(initialAddress.city_id);
                    } else {
                        setSelectedCity('');
                    }
                } catch (error) {
                    console.error('Failed to fetch cities:', error);
                } finally {
                    setIsLoadingLocations(false);
                }
            };
            fetchCities();
        } else {
            console.log(
                '[AddressModal] Skipping cities fetch: no country selected',
            );
            setCities([]);
            setSelectedCity('');
        }
    }, [selectedCountry, initialAddress]);

    // Fetch Districts when City changes
    useEffect(() => {
        if (selectedCity) {
            const fetchDistricts = async () => {
                try {
                    console.log(
                        `[AddressModal] Fetching districts for city: ${selectedCity}...`,
                    );
                    const data = await storeService.getDistricts(
                        Number(selectedCity),
                    );
                    console.log('[AddressModal] Districts response:', data);
                    const districtsArray = Array.isArray(data) ? data : [];
                    setDistricts(districtsArray);
                    if (
                        initialAddress?.district_id &&
                        districtsArray.some(
                            (d) => d.id === initialAddress.district_id,
                        )
                    ) {
                        setSelectedDistrict(initialAddress.district_id);
                    } else {
                        setSelectedDistrict('');
                    }
                } catch (error) {
                    console.error('Failed to fetch districts:', error);
                }
            };
            fetchDistricts();
        } else {
            console.log(
                '[AddressModal] Skipping districts fetch: no city selected',
            );
            setDistricts([]);
            setSelectedDistrict('');
        }
    }, [selectedCity, initialAddress]);

    // Initialize form with existing address if editing
    useEffect(() => {
        if (isOpen) {
            if (initialAddress) {
                setAddressName(
                    initialAddress.label || initialAddress.name || '',
                );
                setRecipientName(initialAddress.recipient_name || '');
                setPhone(initialAddress.phone || '');
                setAddressNotes(
                    initialAddress.description || initialAddress.notes || '',
                );
                setSelectedCountry(initialAddress.country_id || '');
                // Cities and Districts are handled by their respective effects
                setStreet(initialAddress.street || '');
                setBuilding(initialAddress.building || '');
                setUnit(initialAddress.unit || '');
                setPostalCode(initialAddress.postal_code || '');
                setAdditionalNumber(initialAddress.additional_number || '');
                setIsDefault(
                    initialAddress.is_default ||
                        initialAddress.isDefault ||
                        false,
                );

                if (initialAddress.latitude && initialAddress.longitude) {
                    setSelectedLocation([
                        Number(initialAddress.latitude),
                        Number(initialAddress.longitude),
                    ]);
                }
                setFormattedAddress(initialAddress.formatted || '');
            } else {
                setAddressName('');
                setRecipientName('');
                setPhone('');
                setAddressNotes('');
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
            }
        }
    }, [initialAddress, isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
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
            id: initialAddress?.id,
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
            // Keep mapping for UI compatibility
            name: addressName.trim(),
            formatted: formattedAddress || street.trim(),
            notes: addressNotes.trim(),
            latitude: selectedLocation?.[0],
            longitude: selectedLocation?.[1],
        };

        onSave(addressData);
        onClose();
    };

    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setSelectedLocation(location);
            setFormattedAddress(formatted);

            // Try to extract street if possible, but keep it manual for accuracy
            if (!street && formatted) {
                // Heuristic: take first part of formatted address as street
                const parts = formatted.split(',');
                if (parts.length > 0) {
                    // setStreet(parts[0].trim()); // Better let user enter for API accuracy
                }
            }
        },
        [street],
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
                            {initialAddress
                                ? t('editAddress')
                                : t('addNewAddress')}
                        </h2>
                        <div className="w-9" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {/* Left: Enhanced Form */}
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
                                                setSearchQuery(e.target.value)
                                            }
                                            placeholder={t('searchPlaceholder')}
                                            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Form Sections Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Label (Alias) */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('addressName')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={addressName}
                                            onChange={(e) =>
                                                setAddressName(e.target.value)
                                            }
                                            placeholder={t(
                                                'addressNamePlaceholder',
                                            )}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-semibold"
                                        />
                                    </div>

                                    {/* Recipient Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('recipientName')}
                                        </label>
                                        <input
                                            type="text"
                                            value={recipientName}
                                            onChange={(e) =>
                                                setRecipientName(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold"
                                        />
                                    </div>

                                    {/* Phone */}
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
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-bold placeholder:font-normal"
                                        />
                                    </div>

                                    {/* Country */}
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
                                            {countries.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* City */}
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
                                            disabled={isLoadingLocations}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none disabled:opacity-50">
                                            <option value="">
                                                {t('selectCity')}
                                            </option>
                                            {cities.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingLocations && (
                                            <Loader2 className="absolute left-10 top-[38px] w-4 h-4 animate-spin text-theme-primary" />
                                        )}
                                    </div>

                                    {/* District */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('district')}
                                        </label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) =>
                                                setSelectedDistrict(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : '',
                                                )
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none font-semibold appearance-none">
                                            <option value="">
                                                {t('selectDistrict')}
                                            </option>
                                            {districts.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Street */}
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

                                    {/* Building & Unit */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('building')}
                                        </label>
                                        <input
                                            type="text"
                                            value={building}
                                            onChange={(e) =>
                                                setBuilding(e.target.value)
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

                                    {/* Postal & Additional */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('postalCode')}
                                        </label>
                                        <input
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) =>
                                                setPostalCode(e.target.value)
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

                                    {/* Notes */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                                            {t('addressNotes')}
                                        </label>
                                        <textarea
                                            value={addressNotes}
                                            onChange={(e) =>
                                                setAddressNotes(e.target.value)
                                            }
                                            placeholder={t(
                                                'addressNotesPlaceholder',
                                            )}
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-theme-primary outline-none resize-none"
                                        />
                                    </div>

                                    {/* Set Default Toggle */}
                                    <div className="sm:col-span-2 flex items-center gap-3 py-2">
                                        <input
                                            type="checkbox"
                                            id="set-default"
                                            checked={isDefault}
                                            onChange={(e) =>
                                                setIsDefault(e.target.checked)
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

                            {/* Right: Map View */}
                            <div className="flex flex-col gap-4">
                                <div className="h-[300px] lg:h-full min-h-[400px] rounded-[32px] overflow-hidden relative border-4 border-gray-50 shadow-inner">
                                    <AddressMap
                                        center={
                                            selectedLocation ||
                                            DEFAULT_MAP_CENTER
                                        }
                                        onLocationSelect={handleLocationSelect}
                                        searchQuery={searchQuery}
                                    />
                                    <div className="absolute top-4 start-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-theme-primary" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-tight">
                                            Live Map Selection
                                        </span>
                                    </div>
                                </div>

                                {/* Selected Info Overlay for Mobile/Feedback */}
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
                            disabled={!isValid}
                            className={cn(
                                'px-10 py-3 font-black rounded-xl transition-all shadow-lg',
                                isValid
                                    ? 'bg-theme-primary text-white hover:brightness-95 shadow-theme-primary/20 active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-none',
                            )}>
                            {initialAddress ? t('save') : t('addNew')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressModal;
