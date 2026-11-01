import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, MapPinned, X, Loader2, CheckCircle2 } from 'lucide-react';
import { indiaLocations } from '../data/locations';
import { useTranslation } from 'react-i18next';

interface LocationSelectorProps {
  state: string;
  district: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
}


const TN_DISTRICT_COORDS = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Chengalpattu', lat: 12.6939, lng: 79.9757 },
  { name: 'Tiruvallur', lat: 13.1433, lng: 79.9079 },
  { name: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { name: 'Ranipet', lat: 12.9229, lng: 79.3326 },
  { name: 'Tirupathur', lat: 12.4925, lng: 78.5678 },
  { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747 },
  { name: 'Viluppuram', lat: 11.9401, lng: 79.4861 },
  { name: 'Kallakurichi', lat: 11.7384, lng: 78.9639 },
  { name: 'Cuddalore', lat: 11.7480, lng: 79.7714 },
  { name: 'Dharmapuri', lat: 12.1211, lng: 78.1582 },
  { name: 'Krishnagiri', lat: 12.5186, lng: 78.2137 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Namakkal', lat: 11.2189, lng: 78.1674 },
  { name: 'Erode', lat: 11.3410, lng: 77.7172 },
  { name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Nilgiris', lat: 11.4102, lng: 76.6950 },
  { name: 'Karur', lat: 10.9601, lng: 78.0766 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { name: 'Perambalur', lat: 11.2342, lng: 78.8820 },
  { name: 'Ariyalur', lat: 11.1401, lng: 79.0786 },
  { name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
  { name: 'Tiruvarur', lat: 10.7725, lng: 79.6365 },
  { name: 'Nagapattinam', lat: 10.7672, lng: 79.8449 },
  { name: 'Mayiladuthurai', lat: 11.1018, lng: 79.6522 },
  { name: 'Pudukkottai', lat: 10.3797, lng: 78.8208 },
  { name: 'Dindigul', lat: 10.3673, lng: 77.9803 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Theni', lat: 10.0104, lng: 77.4768 },
  { name: 'Virudhunagar', lat: 9.5872, lng: 77.9514 },
  { name: 'Sivaganga', lat: 9.8433, lng: 78.4809 },
  { name: 'Ramanathapuram', lat: 9.3639, lng: 78.8395 },
  { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Tenkasi', lat: 8.9594, lng: 77.3152 },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 }
];

function getClosestTNDistrict(lat: number, lng: number): string | null {
  if (lat >= 7.8 && lat <= 13.8 && lng >= 76.0 && lng <= 80.6) {
    let closest = TN_DISTRICT_COORDS[0].name;
    let minDistance = Infinity;
    for (const d of TN_DISTRICT_COORDS) {
      const dist = (lat - d.lat) ** 2 + (lng - d.lng) ** 2;
      if (dist < minDistance) {
        minDistance = dist;
        closest = d.name;
      }
    }
    return closest;
  }
  return null;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  state, 
  district, 
  onStateChange, 
  onDistrictChange 
}) => {
  const { t } = useTranslation();
  const [stateSearch, setStateSearch] = useState(state || '');
  const [districtSearch, setDistrictSearch] = useState(district || '');
  
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');

  const stateRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  // Synchronize when state or district props update externally
  useEffect(() => {
    setStateSearch(state || '');
  }, [state]);

  useEffect(() => {
    setDistrictSearch(district || '');
  }, [district]);

  const states = Object.keys(indiaLocations);
  const filteredStates = states.filter(s => s.toLowerCase().includes((stateSearch || '').toLowerCase()));
  
  const currentDistricts = state && (indiaLocations as Record<string, string[]>)[state]
    ? (indiaLocations as Record<string, string[]>)[state]
    : [];
  const filteredDistricts = currentDistricts.filter(d => d.toLowerCase().includes((districtSearch || '').toLowerCase()));

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) setIsStateOpen(false);
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) setIsDistrictOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeAndApplyLocation = (rawState: string, rawDistrict: string) => {
    const stateKeys = Object.keys(indiaLocations);
    const rawStateLower = (rawState || '').toLowerCase().trim();

    // 1. Direct or fuzzy state matching
    let matchedState = stateKeys.find(s => s.toLowerCase() === rawStateLower);

    if (!matchedState) {
      if (rawStateLower.includes('tamil') || rawStateLower.includes('nadu')) matchedState = 'Tamil Nadu';
      else if (rawStateLower.includes('kerala')) matchedState = 'Kerala';
      else if (rawStateLower.includes('karnataka')) matchedState = 'Karnataka';
      else if (rawStateLower.includes('delhi')) matchedState = 'Delhi';
      else if (rawStateLower.includes('maharashtra') || rawStateLower.includes('bombay')) matchedState = 'Maharashtra';
      else if (rawStateLower.includes('telangana')) matchedState = 'Telangana';
      else if (rawStateLower.includes('andhra')) matchedState = 'Andhra Pradesh';
      else if (rawStateLower.includes('uttar pradesh') || rawStateLower === 'up') matchedState = 'Uttar Pradesh';
      else if (rawStateLower.includes('gujarat')) matchedState = 'Gujarat';
      else if (rawStateLower.includes('rajasthan')) matchedState = 'Rajasthan';
      else if (rawStateLower.includes('west bengal') || rawStateLower.includes('bengal')) matchedState = 'West Bengal';
      else if (rawStateLower.includes('madhya')) matchedState = 'Madhya Pradesh';
      else if (rawStateLower.includes('bihar')) matchedState = 'Bihar';
      else if (rawStateLower.includes('punjab')) matchedState = 'Punjab';
      else if (rawStateLower.includes('haryana')) matchedState = 'Haryana';
      else if (rawStateLower.includes('odisha') || rawStateLower.includes('orissa')) matchedState = 'Odisha';
      else if (rawStateLower.includes('assam')) matchedState = 'Assam';
      else if (rawStateLower.includes('jharkhand')) matchedState = 'Jharkhand';
      else if (rawStateLower.includes('chhattisgarh')) matchedState = 'Chhattisgarh';
      else if (rawStateLower.includes('himachal')) matchedState = 'Himachal Pradesh';
      else if (rawStateLower.includes('uttarakhand')) matchedState = 'Uttarakhand';
      else if (rawStateLower.includes('goa')) matchedState = 'Goa';
      else {
        matchedState = stateKeys.find(s => rawStateLower.includes(s.toLowerCase()) || s.toLowerCase().includes(rawStateLower));
      }
    }

    if (!matchedState) {
      matchedState = rawState || 'Tamil Nadu';
    }

    // 2. District matching within matched state
    const districtList = (indiaLocations as Record<string, string[]>)[matchedState] || [];
    let matchedDistrict = '';
    const rawDistLower = (rawDistrict || '').toLowerCase().trim();

    if (rawDistLower && districtList.length > 0) {
      matchedDistrict = districtList.find(d => {
        const dLower = d.toLowerCase();
        return dLower === rawDistLower || dLower.includes(rawDistLower) || rawDistLower.includes(dLower);
      }) || '';
    }

    if (!matchedDistrict) {
      // Direct case-insensitive search or contains
      const cleanRaw = rawDistLower.replace(/(district|city|corporation|circle|zone)/g, '').trim();
      if (cleanRaw && districtList.length > 0) {
        matchedDistrict = districtList.find(d => {
          const dl = d.toLowerCase();
          return dl === cleanRaw || dl.includes(cleanRaw) || cleanRaw.includes(dl);
        }) || '';
      }
    }

    if (!matchedDistrict) {
      matchedDistrict = rawDistrict || '';
    }

    // Apply normalized values
    onStateChange(matchedState);
    setStateSearch(matchedState);
    onDistrictChange(matchedDistrict);
    setDistrictSearch(matchedDistrict);

    setLocationSuccess(`${matchedDistrict ? `${matchedDistrict}, ` : ''}${matchedState}`);
    setTimeout(() => setLocationSuccess(''), 5000);
  };

  const fallbackToIPLocation = async () => {
    try {
      let stateName = '';
      let districtName = '';

      // 1. Try BigDataCloud Client IP Reverse Geocoder (Free, high reliability in India)
      try {
        const res = await fetch('https://api-bdc.io/data/reverse-geocode-client?localityLanguage=en');
        if (res.ok) {
          const data = await res.json();
          stateName = data.principalSubdivision || '';
          districtName = data.locality || data.city || '';
        }
      } catch (e) {
        console.warn('BigDataCloud IP lookup failed, checking secondary:', e);
      }

      // 2. Secondary fallback via ipapi
      if (!stateName) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            stateName = data.region || '';
            districtName = data.city || '';
          }
        } catch (e) {
          console.warn('ipapi lookup failed:', e);
        }
      }

      if (stateName) {
        normalizeAndApplyLocation(stateName, districtName);
        setIsLocating(false);
        return;
      }

      setLocationError(t('couldNotDetectLocation', 'Could not detect location automatically. Please select state and district from the list.'));
    } catch {
      setLocationError(t('couldNotDetectLocation', 'Could not detect location automatically. Please select state and district from the list.'));
    } finally {
      setIsLocating(false);
    }
  };

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError('');
    setLocationSuccess('');

    // Strategy 1: Accurate Device GPS coordinates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            let detectedState = '';
            let detectedDistrict = '';

            // A) Direct high-precision Tamil Nadu centroid calculation
            const tnDistrict = getClosestTNDistrict(latitude, longitude);
            if (tnDistrict) {
              detectedState = 'Tamil Nadu';
              detectedDistrict = tnDistrict;
            }

            // B) Modern BigDataCloud Coordinate Reverse Geocoding (api-bdc.io avoids 307 redirect CORS)
            if (!detectedDistrict) {
              try {
                const res = await fetch(
                  `https://api-bdc.io/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                if (res.ok) {
                  const data = await res.json();
                  detectedState = data.principalSubdivision || detectedState || '';
                  detectedDistrict = data.locality || data.city || detectedDistrict || '';
                }
              } catch (err) {
                console.warn('api-bdc coords lookup failed:', err);
              }
            }

            // B) Nominatim Fallback
            if (!detectedState) {
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                  { headers: { 'User-Agent': 'GovSchemeAI/1.0' } }
                );
                if (res.ok) {
                  const data = await res.json();
                  const addr = data.address || {};
                  detectedState = addr.state || addr.province || '';
                  detectedDistrict = addr.state_district || addr.county || addr.city || addr.town || '';
                }
              } catch (err) {
                console.warn('Nominatim coords lookup failed:', err);
              }
            }

            if (detectedState) {
              normalizeAndApplyLocation(detectedState, detectedDistrict);
              setIsLocating(false);
              return;
            }

            // If coordinates could not resolve to state, fallback to IP
            await fallbackToIPLocation();
          } catch {
            await fallbackToIPLocation();
          }
        },
        async (error) => {
          console.warn('Geolocation permission prompt / error:', error.message);
          // Seamless fallback to IP location if permission denied or timeout
          await fallbackToIPLocation();
        },
        { timeout: 7000, maximumAge: 60000, enableHighAccuracy: true }
      );
    } else {
      fallbackToIPLocation();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('State', 'State')}</label>
        <button 
          type="button"
          onClick={detectLocation}
          disabled={isLocating}
          className="text-xs text-[#1769FF] hover:text-blue-700 font-semibold hover:underline flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title={t('useMyLocation', 'Use my location')}
        >
          {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <MapPin className="w-3.5 h-3.5 text-blue-600" />}
          <span>{isLocating ? t('detectingLocation', 'Detecting location...') : t('useMyLocation', 'Use my location')}</span>
        </button>
      </div>

      {locationSuccess && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('locationDetected', 'Location detected')}: {locationSuccess}</span>
        </div>
      )}

      {locationError && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
          <span>{locationError}</span>
          <button 
            type="button" 
            onClick={() => setLocationError('')}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
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
            placeholder={t('searchState', 'Search State...')}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all text-xs sm:text-sm font-medium"
          />
          {stateSearch && (
            <button 
              type="button"
              onClick={() => { setStateSearch(''); onStateChange(''); onDistrictChange(''); setDistrictSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isStateOpen && filteredStates.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {filteredStates.map((s) => (
              <li 
                key={s}
                onClick={() => {
                  onStateChange(s);
                  setStateSearch(s);
                  setIsStateOpen(false);
                }}
                className={`px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2 text-xs sm:text-sm ${s === state ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1769FF] font-bold' : 'text-gray-700 dark:text-gray-200'}`}
              >
                {s === state ? <MapPinned className="w-4 h-4 text-blue-600" /> : <MapPin className="w-4 h-4 opacity-50" />}
                <span>{t(s, s)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* District Autocomplete */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('District', 'District')}</label>
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
              placeholder={state ? t('searchDistrict', 'Search District...') : t('selectStateFirst', 'Select a state first')}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900 text-xs sm:text-sm font-medium"
            />
            {districtSearch && (
              <button 
                type="button"
                onClick={() => { setDistrictSearch(''); onDistrictChange(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isDistrictOpen && state && (
            <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((d) => (
                  <li 
                    key={d}
                    onClick={() => {
                      onDistrictChange(d);
                      setDistrictSearch(d);
                      setIsDistrictOpen(false);
                    }}
                    className={`px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2 text-xs sm:text-sm ${d === district ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1769FF] font-bold' : 'text-gray-700 dark:text-gray-200'}`}
                  >
                    {t(d, d)}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-xs text-gray-500 text-center">{t('noDistrictsFound', 'No districts found')}</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
