import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, MapPinned, X, Loader2 } from 'lucide-react';
import { indiaLocations } from '../data/locations';
import { useTranslation } from 'react-i18next';

interface LocationSelectorProps {
  state: string;
  district: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ state, district, onStateChange, onDistrictChange }) => {
  const { t } = useTranslation();
  const [stateSearch, setStateSearch] = useState(state);
  const [districtSearch, setDistrictSearch] = useState(district);
  
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const stateRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  const states = Object.keys(indiaLocations);
  const filteredStates = states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  
  const currentDistricts = state && indiaLocations[state as keyof typeof indiaLocations] ? indiaLocations[state as keyof typeof indiaLocations] : [];
  const filteredDistricts = currentDistricts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()));

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) setIsStateOpen(false);
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) setIsDistrictOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Mocking reverse geocoding for demonstration
            // In a real app, you would call a reverse geocoding API here.
            setTimeout(() => {
              onStateChange('Tamil Nadu');
              setStateSearch('Tamil Nadu');
              onDistrictChange('Chennai');
              setDistrictSearch('Chennai');
              setIsLocating(false);
            }, 1000);
          } catch (error) {
            setLocationError(t('We couldn\'t determine your exact location. Select manually.'));
            setIsLocating(false);
          }
        },
        (error) => {
          setLocationError(t('Location access denied. Please select manually.'));
          setIsLocating(false);
        }
      );
    } else {
      setLocationError(t('Geolocation is not supported by your browser.'));
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('State')}</label>
        <button 
          onClick={detectLocation}
          disabled={isLocating}
          className="text-xs text-[#1769FF] font-semibold hover:underline flex items-center gap-1"
        >
          {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
          {isLocating ? t('Detecting location...') : t('Use my location')}
        </button>
      </div>

      {locationError && (
        <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{locationError}</p>
      )}

      {/* State Autocomplete */}
      <div className="relative" ref={stateRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={stateSearch}
            onChange={(e) => {
              setStateSearch(e.target.value);
              setIsStateOpen(true);
              if (e.target.value !== state) {
                onStateChange('');
                onDistrictChange('');
                setDistrictSearch('');
              }
            }}
            onFocus={() => setIsStateOpen(true)}
            placeholder={t('Search State...')}
            className="w-full pl-10 pr-10 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all"
          />
          {stateSearch && (
            <button 
              onClick={() => { setStateSearch(''); onStateChange(''); onDistrictChange(''); setDistrictSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isStateOpen && filteredStates.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredStates.map((s) => (
              <li 
                key={s}
                onClick={() => {
                  onStateChange(s);
                  setStateSearch(s);
                  setIsStateOpen(false);
                }}
                className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2 text-sm ${s === state ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1769FF] font-semibold' : 'text-gray-700 dark:text-gray-200'}`}
              >
                {s === state ? <MapPinned className="w-4 h-4" /> : <MapPin className="w-4 h-4 opacity-50" />}
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* District Autocomplete */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('District')}</label>
        <div className="relative" ref={districtRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={districtSearch}
              disabled={!state}
              onChange={(e) => {
                setDistrictSearch(e.target.value);
                setIsDistrictOpen(true);
                if (e.target.value !== district) onDistrictChange('');
              }}
              onFocus={() => setIsDistrictOpen(true)}
              placeholder={state ? t('Search District...') : t('Select a state first')}
              className="w-full pl-10 pr-10 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900"
            />
            {districtSearch && (
              <button 
                onClick={() => { setDistrictSearch(''); onDistrictChange(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isDistrictOpen && state && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((d) => (
                  <li 
                    key={d}
                    onClick={() => {
                      onDistrictChange(d);
                      setDistrictSearch(d);
                      setIsDistrictOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2 text-sm ${d === district ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1769FF] font-semibold' : 'text-gray-700 dark:text-gray-200'}`}
                  >
                    {d}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-500 text-center">{t('No districts found')}</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
