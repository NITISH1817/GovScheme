import React, { useState, useMemo } from 'react';
import { Scheme, UserProfile, CombinedSchemeAnalysis } from '../types';
import { useTranslation } from 'react-i18next';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';
import { computeMLRecommendation } from '../engine/mlEngine';
import { performSemanticSearch } from '../engine/semanticSearch';
import { Bookmark, BookmarkCheck, ExternalLink, Check, Search, Filter, Mic, MicOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SchemeComparisonModal } from './SchemeComparisonModal';

interface SchemeDiscoveryProps {
  schemes: Scheme[];
  user: UserProfile;
  currentLang: string;
  onSelectScheme: (analysis: CombinedSchemeAnalysis) => void;
  onToggleBookmark: (schemeId: string) => void;
  isBookmarked: (schemeId: string) => boolean;
}

export const SchemeDiscovery: React.FC<SchemeDiscoveryProps> = ({
  schemes,
  user,
  currentLang,
  onSelectScheme,
  onToggleBookmark,
  isBookmarked
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [compareQueue, setCompareQueue] = useState<Scheme[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);
  const [semanticResults, setSemanticResults] = useState<{schemeId: string, score: number}[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filters
  const [selectedGovtLevel, setSelectedGovtLevel] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
      const matchCat = selectedCategories.some(cat => a.scheme.category.includes(cat));
      if (!matchCat) return false;
    }

    // Eligibility
    if (selectedEligibility.length > 0) {
      if (!selectedEligibility.includes(a.ruleResult.status)) return false;
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
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight mb-2">
            {t('yourRecSchemes', 'Your recommended schemes')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('basedOnInfo', 'Based on the information you provided. We found')} <strong className="text-gray-900 dark:text-white">{analyzedSchemes.length}</strong> {t('matchingSchemes', 'matching schemes.')}
          </p>
        </div>

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
                    {['Education', 'Agriculture', 'Healthcare', 'Employment', 'Housing', 'Business'].map(cat => (
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
                    {['Eligible', 'Conditionally Eligible', 'Almost Eligible', 'Needs Review'].map(el => (
                      <label key={el} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedEligibility.includes(el)}
                          onChange={() => toggleFilter(setSelectedEligibility, el)}
                          className="rounded border-gray-300 text-[#1769FF] focus:ring-[#1769FF]" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {el === 'Conditionally Eligible' ? t('potentiallyEligible', 'Potentially eligible') : el === 'Almost Eligible' ? t('almostEligible', 'Almost eligible') : el === 'Needs Review' ? t('needsMoreInfo', 'Needs more information') : t('eligible', el)}
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
                type="text" 
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
                  title={t('searchByVoice', 'Search by Voice')}
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
                            <Zap className="w-3 h-3 inline-block mr-0.5" /> Semantic Match: {(semanticScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => onToggleBookmark(scheme.id)}
                        className="text-gray-400 hover:text-[#F59E0B] transition-colors"
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

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                        {scheme.state === 'Central' ? t('centralGovt', 'Central Govt') : t('stateGovt', 'State Govt')}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        ruleResult.status === 'Eligible' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        ruleResult.status === 'Conditionally Eligible' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                        ruleResult.status === 'Almost Eligible' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' :
                        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {ruleResult.status === 'Eligible' ? t('eligible', 'Eligible') : ruleResult.status === 'Conditionally Eligible' ? t('potentiallyEligible', 'Conditionally Eligible') : ruleResult.status === 'Almost Eligible' ? t('almostEligible', 'Almost Eligible') : t('needsMoreInfo', 'Needs Review')}
                      </span>
                    </div>

                    {scheme.financialBenefitAmount && (
                      <div className="mb-4">
                        <span className="text-sm font-bold text-[#15803D]">₹{scheme.financialBenefitAmount.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-500 ml-1">{t('benefit', 'benefit')}</span>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('whyYouMatch', 'Why you match')}</span>
                      <ul className="space-y-1">
                        {ruleResult.matchedCriteria.slice(0, 2).map((factor, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <Check className="w-3 h-3 text-[#15803D] shrink-0" />
                            <span className="line-clamp-1">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 dark:bg-[#07111F] border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
                    <button 
                      onClick={() => onSelectScheme({ scheme, ruleResult, mlResult })}
                      className="flex-1 py-2 rounded border border-[#123C69] text-[#123C69] dark:border-gray-600 dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {t('details', 'Details')}
                    </button>
                    <button 
                      onClick={() => toggleCompare(scheme)}
                      className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${
                        compareQueue.find(s => s.id === scheme.id) 
                          ? 'bg-[#123C69] text-white' 
                          : 'bg-white dark:bg-[#16243A] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {compareQueue.find(s => s.id === scheme.id) ? t('added', 'Added') : t('compare', 'Compare')}
                    </button>
                    <button 
                      onClick={() => window.open(scheme.officialApplyUrl || '#', '_blank')}
                      className="flex-1 py-2 rounded bg-[#1769FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      {t('apply', 'Apply')} <ExternalLink className="w-4 h-4" />
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
                  No exact matches found for "{searchTerm}".
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  Try these alternatives based on related eligibility criteria and broader location signals.
                </p>
                
                <div className="text-left bg-gray-50 dark:bg-[#07111F] border border-gray-200 dark:border-gray-700 p-6 rounded-lg w-full max-w-md">
                  <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 block">Try these alternatives:</span>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <button onClick={() => { setSelectedCategories([]); setSelectedGovtLevel([]); setSelectedEligibility([]); }} className="hover:text-[#1769FF] transition-colors text-left">Remove all current filters (Similar Categories)</button>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <button onClick={() => { setSelectedState(''); }} className="hover:text-[#1769FF] transition-colors text-left">Search all of India (Broader Location)</button>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <button onClick={() => { setSelectedGovtLevel(['Central']); }} className="hover:text-[#1769FF] transition-colors text-left">Explore Central Government schemes (Nearby Eligibility)</button>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
                      <span>Ask the AI Document Assistant for help</span>
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
