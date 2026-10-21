import React, { useState, useMemo, useEffect } from 'react';
import { Scheme, UserProfile, CombinedSchemeAnalysis } from '../types';
import { useTranslation } from 'react-i18next';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';
import { computeMLRecommendation } from '../engine/mlEngine';
import { performSemanticSearch } from '../engine/semanticSearch';
import { Bookmark, BookmarkCheck, ExternalLink, Check, Search, Filter, Mic, MicOff, Zap, AlertCircle, AlertTriangle, Globe, CheckCircle2, XCircle, LayoutDashboard, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SchemeComparisonModal } from './SchemeComparisonModal';
import { getMissingProfileFields } from '../utils/profileUtils';

interface SchemeDiscoveryProps {
  schemes: Scheme[];
  user: UserProfile | null;
  currentLang: string;
  initialCategory?: string;
  initialViewMode?: 'recommended' | 'all' | 'ineligible';
  onSelectScheme: (analysis: CombinedSchemeAnalysis) => void;
  onToggleBookmark: (schemeId: string) => void;
  isBookmarked: (schemeId: string) => boolean;
  onNavigateTab?: (tab: string) => void;
}

export const SchemeDiscovery: React.FC<SchemeDiscoveryProps> = ({
  schemes,
  user,
  currentLang,
  initialCategory,
  initialViewMode,
  onSelectScheme,
  onToggleBookmark,
  isBookmarked,
  onNavigateTab
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [compareQueue, setCompareQueue] = useState<Scheme[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);
  const [semanticResults, setSemanticResults] = useState<{schemeId: string, score: number}[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'recommended' | 'all' | 'ineligible'>(
    initialViewMode || 'recommended'
  );

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);
  
  // Filters
  const [selectedGovtLevel, setSelectedGovtLevel] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    return initialCategory ? [initialCategory] : [];
  });

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);
  const [selectedEligibility, setSelectedEligibility] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Compute recommendations
  const analyzedSchemes = useMemo(() => {
    return schemes.map(scheme => {
      const ruleRes = evaluateSchemeEligibility(user, scheme);
      const mlRes = computeMLRecommendation(user, scheme, ruleRes, schemes);
      return { scheme, ruleResult: ruleRes, mlResult: mlRes };
    }).sort((a, b) => b.mlResult.confidenceScore - a.mlResult.confidenceScore);
  }, [schemes, user, currentLang]);

  const { recommendedCount, ineligibleCount, totalCount } = useMemo(() => {
    let rec = 0;
    let inelig = 0;
    for (const a of analyzedSchemes) {
      if (a.ruleResult.status === 'Eligible' || a.ruleResult.status === 'Conditionally Eligible') {
        rec++;
      } else if (a.ruleResult.status === 'Not Eligible' || a.ruleResult.status === 'Almost Eligible') {
        inelig++;
      }
    }
    return {
      recommendedCount: rec,
      ineligibleCount: inelig,
      totalCount: schemes.length
    };
  }, [analyzedSchemes, schemes.length]);

  const missingFields = useMemo(() => getMissingProfileFields(user), [user]);

  const handleSemanticSearch = async (val: string) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setSemanticResults(null);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    setIsSearchingSemantic(true);
    const results = await performSemanticSearch(val, schemes);
    setSemanticResults(results.map(r => ({ schemeId: r.scheme.id, score: r.score })));
    setIsSearchingSemantic(false);
  };

  const predefinedSuggestions = [
    "Scholarships for students",
    "Education assistance",
    "Farmer subsidies",
    "Women entrepreneurship schemes",
    "Housing assistance"
  ].filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()) && s.toLowerCase() !== searchTerm.toLowerCase());

  const filteredSchemes = analyzedSchemes.filter(a => {
    // If semantic search is active, filter based on results
    if (semanticResults) {
      if (!semanticResults.find(r => r.schemeId === a.scheme.id)) return false;
    } else {
      const matchesSearch = a.scheme.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    // Govt level
    const isCentral = a.scheme.state === 'Central';
    const govtLevel = isCentral ? 'Central' : 'State';
    if (selectedGovtLevel.length > 0 && !selectedGovtLevel.includes(govtLevel)) return false;

    // Categories
    if (selectedCategories.length > 0) {
      const matchCat = selectedCategories.some(cat => {
        const catLower = cat.toLowerCase();
        const schemeCatLower = a.scheme.category.toLowerCase();
        const tags = (a.scheme.tags || []).map(t => t.toLowerCase());

        if (cat === 'Education') {
          return schemeCatLower.includes('education') || tags.includes('scholarship') || tags.includes('student');
        }
        if (cat === 'Agriculture') {
          return schemeCatLower.includes('agriculture') || schemeCatLower.includes('farmer') || tags.includes('farmer') || tags.includes('agriculture');
        }
        if (cat === 'Healthcare') {
          return schemeCatLower.includes('health') || tags.includes('health') || tags.includes('medical');
        }
        if (cat === 'Housing') {
          return schemeCatLower.includes('housing') || schemeCatLower.includes('shelter') || tags.includes('housing');
        }
        if (cat === 'Employment') {
          return schemeCatLower.includes('employment') || schemeCatLower.includes('enterprise') || tags.includes('employment') || tags.includes('job card');
        }
        if (cat === 'Women & Child') {
          return schemeCatLower.includes('women') || schemeCatLower.includes('child') || tags.includes('women') || tags.includes('girl child');
        }
        if (cat === 'Entrepreneurship') {
          return schemeCatLower.includes('enterprise') || schemeCatLower.includes('credit') || tags.includes('entrepreneurship') || tags.includes('startup') || tags.includes('msme') || tags.includes('mudra');
        }
        if (cat === 'Financial Help') {
          return schemeCatLower.includes('credit') || schemeCatLower.includes('financial') || schemeCatLower.includes('pension') || schemeCatLower.includes('food') || tags.includes('loan') || tags.includes('dbt');
        }

        return schemeCatLower.includes(catLower);
      });
      if (!matchCat) return false;
    }

    // Eligibility & View Mode Filter
    if (selectedEligibility.length > 0) {
      if (!selectedEligibility.includes(a.ruleResult.status)) return false;
    } else {
      if (viewMode === 'recommended') {
        if (user && (a.ruleResult.status === 'Not Eligible' || a.ruleResult.status === 'Almost Eligible')) {
          return false;
        }
      } else if (viewMode === 'ineligible') {
        if (a.ruleResult.status !== 'Not Eligible' && a.ruleResult.status !== 'Almost Eligible') {
          return false;
        }
      }
      // If viewMode === 'all', show all schemes without exclusion
    }
    
    // Location
    if (selectedState && a.scheme.state !== 'Central' && a.scheme.state !== selectedState) return false;
    // Note: if scheme has district specific array, we could filter it here.

    
    return true;
  }).sort((a, b) => {
    if (semanticResults) {
      const scoreA = semanticResults.find(r => r.schemeId === a.scheme.id)?.score || 0;
      const scoreB = semanticResults.find(r => r.schemeId === b.scheme.id)?.score || 0;
      return scoreB - scoreA;
    }
    return 0; // retain ml-based sort if no semantic search
  });

  const toggleFilter = (setFn: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setFn(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const toggleCompare = (scheme: Scheme) => {
    setCompareQueue(prev => {
      if (prev.find(s => s.id === scheme.id)) return prev.filter(s => s.id !== scheme.id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, scheme];
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header with Title and Mode Switcher */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1769FF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {viewMode === 'recommended' ? t('recommended', 'Recommended') : viewMode === 'ineligible' ? t('notEligible', 'Not Applicable') : t('allSchemes', 'All Schemes')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight">
                {viewMode === 'recommended'
                  ? t('yourRecSchemes', 'Your Recommended Schemes')
                  : viewMode === 'ineligible'
                  ? t('notApplicableForYou', 'Not Applicable Schemes')
                  : t('totalSchemesAvailable', 'Total Schemes Available')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                {viewMode === 'recommended'
                  ? (user 
                      ? `${t('basedOnInfo', 'Based on your profile, we found')} ${filteredSchemes.length} ${t('matchingSchemes', 'matching schemes.')}`
                      : t('guestNoticeDesc', 'Showing schemes with general eligibility. Complete your profile to see personalized matches.'))
                  : viewMode === 'ineligible'
                  ? `Showing ${filteredSchemes.length} schemes where your profile does not meet eligibility requirements. Inspect the mismatch reasons on each card.`
                  : `Showing ${filteredSchemes.length} of ${totalCount} Central & State government schemes nationwide.`}
              </p>
            </div>

            {/* Quick Segmented Mode Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-[#0B1424] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('recommended')}
                className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'recommended'
                    ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('recommendedForYou', 'Recommended')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  viewMode === 'recommended' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {recommendedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-[#123C69] dark:bg-[#1769FF] text-white shadow-md scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('totalSchemesAvailable', 'Total Available')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  viewMode === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('ineligible')}
                className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'ineligible'
                    ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t('notApplicableForYou', 'Not Applicable')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  viewMode === 'ineligible' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {ineligibleCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {(!user || missingFields.length > 0) && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {!user ? t('browsingAsGuest', 'Browsing as Guest Citizen') : t('profileIncompleteNotice', 'Your citizen profile is missing required information')}
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  {!user
                    ? t('guestNoticeDesc', 'Schemes are displayed with general criteria. Complete the Guided Eligibility Wizard to see your personalized eligibility matches.')
                    : `${t('missingFieldsExplanation', 'Recommendations require full demographic verification. Missing:')} `}
                  {user && <strong>{missingFields.join(', ')}</strong>}
                </p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('wizard')}
                className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold transition"
              >
                {!user ? t('checkEligibilityWizard', 'Check Eligibility Wizard') : t('completeProfileNow', 'Complete Profile Now')}
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4 text-[#123C69] dark:text-white font-bold">
                <Filter className="w-4 h-4" /> {t('filters', 'Filters')}
              </div>
              
              <div className="space-y-6">
                {/* Government Level */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('govtLevel', 'Government Level')}</h3>
                  <div className="space-y-2">
                    {['Central', 'State'].map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedGovtLevel.includes(level)}
                          onChange={() => toggleFilter(setSelectedGovtLevel, level)}
                          className="rounded border-gray-300 text-[#1769FF] focus:ring-[#1769FF]" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t(`filterLevel_${level}`, level)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* State Location */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('location', 'Location')}</h3>
                  <select 
                    value={selectedState} 
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none"
                  >
                    <option value="">{t('allStates', 'All States')}</option>
                    <option value="Tamil Nadu">{t('state_TamilNadu', 'Tamil Nadu')}</option>
                    <option value="Maharashtra">{t('state_Maharashtra', 'Maharashtra')}</option>
                    <option value="Kerala">{t('state_Kerala', 'Kerala')}</option>
                    <option value="Karnataka">{t('state_Karnataka', 'Karnataka')}</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('category', 'Category')}</h3>
                  <div className="space-y-2">
                    {[
                      'Education',
                      'Agriculture',
                      'Healthcare',
                      'Housing',
                      'Employment',
                      'Women & Child',
                      'Entrepreneurship',
                      'Financial Help'
                    ].map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleFilter(setSelectedCategories, cat)}
                          className="rounded border-gray-300 text-[#1769FF] focus:ring-[#1769FF]" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t(`filterCat_${cat}`, cat)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('eligibility', 'Eligibility')}</h3>
                  <div className="space-y-2">
                    {['Eligible', 'Conditionally Eligible', 'Almost Eligible', 'Insufficient Information', 'Not Eligible'].map(el => (
                      <label key={el} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedEligibility.includes(el)}
                          onChange={() => toggleFilter(setSelectedEligibility, el)}
                          className="rounded border-gray-300 text-[#1769FF] focus:ring-[#1769FF]" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {el === 'Conditionally Eligible' ? t('potentiallyEligible', 'Potentially eligible') : el === 'Almost Eligible' ? t('almostEligible', 'Almost eligible') : el === 'Insufficient Information' ? t('insufficientInformation', 'Information Needed') : el === 'Not Eligible' ? t('notEligible', 'Not Eligible') : t('eligible', el)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Results Grid */}
          <main className="flex-1 space-y-6">
            
            <div className="relative w-full group z-20">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isSearchingSemantic ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
              <input 
                id="scheme-search-input"
                type="text" 
                aria-label={t('searchSchemesPlaceholder', "Semantic Search... e.g. 'scholarships for girls in Tamil Nadu'")}
                placeholder={isListening ? t('listeningSpeech', "Listening... Speak your need (e.g. 'help with college fees')") : t('searchSchemesPlaceholder', "Semantic Search... e.g. 'scholarships for girls in Tamil Nadu'")}
                value={searchTerm}
                onChange={(e) => handleSemanticSearch(e.target.value)}
                onFocus={() => { if(searchTerm) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className={`w-full pl-11 pr-16 py-3 rounded bg-white dark:bg-[#0F1B2D] border ${isListening ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF]'} outline-none text-gray-900 dark:text-white transition-all shadow-sm`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {semanticResults && <span title="Powered by ChromaDB Semantic Search"><Zap className="w-4 h-4 text-emerald-500" /></span>}
                <button 
                  onClick={() => setIsListening(!isListening)}
                  className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title={isListening ? t('stopListening', 'Stop Listening') : t('searchByVoice', 'Search by Voice')}
                  aria-label={isListening ? t('stopListening', 'Stop Listening') : t('searchByVoice', 'Search by Voice')}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>

              {/* Smart Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && predefinedSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden"
                  >
                    <ul>
                      {predefinedSuggestions.map((sug, i) => (
                        <li key={i}>
                          <button 
                            onClick={() => {
                              handleSemanticSearch(sug);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#16243A] text-sm text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
                          >
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                            {sug}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Multilingual & Transliteration Search Hint */}
              <div className="flex items-center gap-1.5 mt-2 px-1 text-[11px] text-gray-500 dark:text-gray-400">
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">
                  {t('multilingualSearchHint', 'Search in English, Hindi, Tamil, Telugu, Malayalam, Marathi, Gujarati or Romanized terms (e.g., किसान, கல்வி, rythu, apy)')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSchemes.map(({ scheme, ruleResult, mlResult }) => {
                const semanticScore = semanticResults?.find(r => r.schemeId === scheme.id)?.score;
                return (
                <div key={scheme.id} className="bg-white dark:bg-[#0F1B2D] rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col hover:shadow-md transition-shadow relative">
                  
                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-[#16243A] text-xs font-semibold text-gray-600 dark:text-gray-300 w-fit">
                          {t(scheme.category, scheme.category).split('&')[0]}
                        </span>
                        {semanticScore && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${semanticScore > 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            <Zap className="w-3 h-3 inline-block mr-0.5" /> {t('semanticMatchLabel', 'Semantic Match')}: {(semanticScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => onToggleBookmark(scheme.id)}
                        className="text-gray-400 hover:text-[#F59E0B] transition-colors p-1"
                        aria-label={isBookmarked(scheme.id) ? t('removeBookmark', 'Remove bookmark') : t('saveBookmark', 'Bookmark scheme')}
                      >
                        {isBookmarked(scheme.id) ? <BookmarkCheck className="w-5 h-5 text-[#F59E0B]" fill="currentColor" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-[#123C69] dark:text-white mb-2 line-clamp-2">
                      {t(`${scheme.id}_name`, scheme.name)}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {t(`${scheme.id}_desc`, scheme.shortDescription)}
                    </p>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                        {scheme.state === 'Central' ? t('centralGovt', 'Central Govt') : t('stateGovt', 'State Govt')}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${
                        ruleResult.status === 'Eligible' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        ruleResult.status === 'Conditionally Eligible' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                        ruleResult.status === 'Almost Eligible' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' :
                        ruleResult.status === 'Insufficient Information' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      }`}>
                        {ruleResult.status === 'Eligible' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> :
                         ruleResult.status === 'Conditionally Eligible' ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> :
                         ruleResult.status === 'Almost Eligible' ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> :
                         ruleResult.status === 'Insufficient Information' ? <HelpCircle className="w-3.5 h-3.5 shrink-0" /> :
                         <XCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>
                          {ruleResult.status === 'Eligible' ? t('eligible', 'Eligible') :
                           ruleResult.status === 'Conditionally Eligible' ? t('potentiallyEligible', 'Conditionally Eligible') :
                           ruleResult.status === 'Almost Eligible' ? t('almostEligible', 'Almost Eligible') :
                           ruleResult.status === 'Insufficient Information' ? t('insufficientInformation', 'Information Needed') :
                           t('notEligible', 'Not Eligible')}
                        </span>
                      </span>
                      {scheme.verificationStatus && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {scheme.verificationStatus === 'ADMIN_VERIFIED' ? '✓ Admin Verified' : '✓ Portal Curated'}
                        </span>
                      )}
                    </div>

                    {scheme.financialBenefitAmount && (
                      <div className="mb-4">
                        <span className="text-sm font-bold text-[#15803D]">₹{scheme.financialBenefitAmount.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-500 ml-1">{t('benefit', 'benefit')}</span>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      {ruleResult.status === 'Not Eligible' || ruleResult.failedCriteria.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {t('whyNotApplicable', 'Why You Are Not Applicable')}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {ruleResult.failedCriteria.length > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                                  ✕ {ruleResult.failedCriteria.length} {t('criteriaUnmet', 'Unmet')}
                                </span>
                              )}
                              {ruleResult.matchedCriteria.length > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  ✓ {ruleResult.matchedCriteria.length} {t('criteriaSatisfied', 'Met')}
                                </span>
                              )}
                            </div>
                          </div>

                          {ruleResult.failedCriteria.length > 0 ? (
                            <div className="p-3 rounded-xl bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 mb-2">
                              <ul className="space-y-1.5">
                                {ruleResult.failedCriteria.map((reason, idx) => (
                                  <li key={idx} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5 leading-snug">
                                    <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : !user ? (
                            <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/40 mb-2">
                              {t('signInToCheckEligibility', 'Sign in to verify if you qualify')}
                            </div>
                          ) : null}

                          {ruleResult.matchedCriteria.length > 0 && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                              ✓ {t('satisfied', 'Satisfied')}: {ruleResult.matchedCriteria.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : ruleResult.status === 'Insufficient Information' ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" />
                              {t('eligibilityPending', 'ELIGIBILITY PENDING')}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              ? {ruleResult.informationNeeded?.length || 0} {t('criteriaNeeded', 'Needed')}
                            </span>
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium py-1">
                            {ruleResult.informationNeeded && ruleResult.informationNeeded.length > 0
                              ? `Verify with: ${ruleResult.informationNeeded.slice(0, 3).join(', ')}`
                              : t('completeProfileToVerify', 'Complete profile to verify eligibility')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t('whyYouMatch', 'WHY YOU MATCH')}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              ✓ {ruleResult.matchedCriteria.length} {t('criteriaSatisfied', 'Criteria Met')}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {ruleResult.matchedCriteria.slice(0, 3).map((factor, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <Check className="w-3 h-3 text-[#15803D] shrink-0" />
                                <span className="line-clamp-1">{t(factor, factor)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 dark:bg-[#07111F] border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button 
                      onClick={() => onSelectScheme({ scheme, ruleResult, mlResult })}
                      className="flex-1 min-h-[44px] py-2 px-3 rounded border border-[#123C69] text-[#123C69] dark:border-gray-600 dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center text-center"
                    >
                      {ruleResult.status === 'Not Eligible' ? t('whyNotApplicable', 'Why Not Applicable') : t('details', 'Details')}
                    </button>
                    <button 
                      onClick={() => toggleCompare(scheme)}
                      className={`flex-1 min-h-[44px] py-2 px-3 rounded font-semibold text-sm transition-colors flex items-center justify-center text-center ${
                        compareQueue.find(s => s.id === scheme.id) 
                          ? 'bg-[#123C69] text-white' 
                          : 'bg-white dark:bg-[#16243A] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {compareQueue.find(s => s.id === scheme.id) ? t('added', 'Added') : t('compare', 'Compare')}
                    </button>
                    <button 
                      onClick={() => window.open(scheme.officialApplyUrl || '#', '_blank')}
                      className="flex-1 min-h-[44px] py-2 px-3 rounded bg-[#1769FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 text-center"
                    >
                      <span>{t('apply', 'Apply')}</span> <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )})}
            </div>
            
            {filteredSchemes.length === 0 && (
              <div className="col-span-1 md:col-span-2 flex flex-col items-center text-center py-16 px-4 bg-white dark:bg-[#0F1B2D] rounded border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight mb-2">
                  {t('noExactMatches', 'No exact matches found for')} "{searchTerm}".
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  {t('noMatchesSubtitle', 'Try these alternatives based on related eligibility criteria and broader location signals.')}
                </p>
                
                <div className="text-left bg-gray-50 dark:bg-[#07111F] border border-gray-200 dark:border-gray-700 p-6 rounded-lg w-full max-w-md">
                  <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 block">
                    {t('tryAlternativesTitle', 'Try these alternatives:')}
                  </span>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <button onClick={() => { setSelectedCategories([]); setSelectedGovtLevel([]); setSelectedEligibility([]); }} className="hover:text-[#1769FF] transition-colors text-left">
                        {t('removeFiltersOption', 'Remove all current filters (Similar Categories)')}
                      </button>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <button onClick={() => { setSelectedState(''); }} className="hover:text-[#1769FF] transition-colors text-left">
                        {t('searchAllIndiaOption', 'Search all of India (Broader Location)')}
                      </button>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <button onClick={() => { setSelectedGovtLevel(['Central']); }} className="hover:text-[#1769FF] transition-colors text-left">
                        {t('exploreCentralOption', 'Explore Central Government schemes (Nearby Eligibility)')}
                      </button>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <span>{t('askAIAssistantOption', 'Ask the AI Document Assistant for help')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Floating Compare Bar */}
      {compareQueue.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#123C69] text-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold">{compareQueue.length} {t('schemesCount', 'schemes')}</span> {t('selectedForComparison', 'selected for comparison (Max 3)')}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCompareQueue([])} 
                className="px-4 py-2 text-sm font-semibold hover:bg-white/10 rounded transition-colors"
              >
                {t('clear', 'Clear')}
              </button>
              <button 
                disabled={compareQueue.length < 2}
                onClick={() => setShowComparison(true)}
                className="px-6 py-2 bg-[#1769FF] text-white font-bold rounded shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                {t('compareNow', 'Compare Now')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Modal */}
      <SchemeComparisonModal 
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        schemes={compareQueue}
      />

    </div>
  );
};
