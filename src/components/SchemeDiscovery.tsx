import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Bookmark,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Info,
  ShieldAlert
} from 'lucide-react';
import { Scheme, UserProfile, RuleEvaluationResult, MLRecommendationResult, CombinedSchemeAnalysis, LanguageCode } from '../types';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';
import { computeMLRecommendation } from '../engine/mlEngine';
import { useTranslation } from 'react-i18next';

interface SchemeDiscoveryProps {
  schemes: Scheme[];
  user: UserProfile;
  currentLang: LanguageCode;
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'Recommended' | 'All' | 'Central' | 'State' | 'Trending' | 'Saved'>('Recommended');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedOccupationFilter, setSelectedOccupationFilter] = useState<string>('All');
  const [selectedIncomeFilter, setSelectedIncomeFilter] = useState<string>('All');

  // Compute Rule + ML analysis for all schemes
  const analyzedSchemes: CombinedSchemeAnalysis[] = useMemo(() => {
    return schemes.map(scheme => {
      const ruleResult = evaluateSchemeEligibility(user, scheme);
      const mlResult = computeMLRecommendation(user, scheme, ruleResult, schemes);
      return {
        scheme,
        ruleResult,
        mlResult
      };
    });
  }, [schemes, user]);

  // Unique Filter Options
  const statesList = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach(s => {
      if (s.state !== 'Central') set.add(s.state);
    });
    return ['All', 'Central', ...Array.from(set)];
  }, [schemes]);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach(s => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [schemes]);

  // Filtered & ML Ranked List
  const filteredSchemes = useMemo(() => {
    return analyzedSchemes
      .filter(item => {
        const { scheme, ruleResult } = item;

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = scheme.name.toLowerCase().includes(q);
          const matchesDesc = scheme.shortDescription.toLowerCase().includes(q);
          const matchesDept = scheme.department.toLowerCase().includes(q);
          const matchesTag = scheme.tags.some(t => t.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesDept && !matchesTag) return false;
        }

        // Tab Filter
        if (activeCategoryTab === 'Recommended' && ruleResult.status === 'Not Eligible') return false;
        if (activeCategoryTab === 'Central' && scheme.state !== 'Central') return false;
        if (activeCategoryTab === 'State' && scheme.state === 'Central') return false;
        if (activeCategoryTab === 'Trending' && (scheme.popularityScore ?? 0) < 90) return false;
        if (activeCategoryTab === 'Saved' && !isBookmarked(scheme.id)) return false;

        // Filter Dropdowns
        if (selectedStateFilter !== 'All') {
          if (selectedStateFilter === 'Central' && scheme.state !== 'Central') return false;
          if (selectedStateFilter !== 'Central' && scheme.state !== selectedStateFilter && scheme.state !== 'Central') return false;
        }
        if (selectedCategoryFilter !== 'All' && scheme.category !== selectedCategoryFilter) return false;
        if (selectedOccupationFilter !== 'All') {
          const occs = scheme.eligibilityRules.allowedOccupations || [];
          if (!occs.some(o => o.toLowerCase().includes(selectedOccupationFilter.toLowerCase()))) return false;
        }

        // Income Range Filter
        if (selectedIncomeFilter !== 'All') {
          const maxInc = scheme.eligibilityRules.maxAnnualIncome;
          if (selectedIncomeFilter === 'bpl' && (!maxInc || maxInc > 120000)) return false;
          if (selectedIncomeFilter === '2.5l' && (!maxInc || maxInc > 250000)) return false;
          if (selectedIncomeFilter === '5l' && (!maxInc || maxInc > 500000)) return false;
        }

        return true;
      })
      .sort((a, b) => b.mlResult.confidenceScore - a.mlResult.confidenceScore);
  }, [analyzedSchemes, searchQuery, activeCategoryTab, selectedStateFilter, selectedCategoryFilter, selectedOccupationFilter, selectedIncomeFilter, isBookmarked]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>NATIONAL WELFARE SCHEME DISCOVERY PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-uswds-primary font-sans flex items-center gap-2 tracking-tight">
            <Sparkles className="w-8 h-8 text-uswds-secondary" />
            {t('discoverSchemes', 'Discover Schemes')}
          </h1>
          <p className="text-sm text-uswds-textMuted mt-1 font-medium">
            {t('discoverSchemesDesc', 'AI-powered scheme recommendations based on your verified profile data.')}
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-uswds-textMuted" />
          <input
            type="text"
            placeholder={t('searchSchemes', 'Search for schemes, e.g. "Agriculture", "Housing"')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded border border-uswds-border bg-white text-uswds-text font-medium text-sm focus:ring-2 focus:ring-uswds-primary shadow-sm outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-uswds-border pb-3">
        {[
          { id: 'Recommended', label: `✨ ${t('recommendedSchemes', 'Recommended')}`, count: analyzedSchemes.filter(a => a.ruleResult.status !== 'Not Eligible').length },
          { id: 'All', label: t('allSchemes', 'All Schemes'), count: schemes.length },
          { id: 'Central', label: t('centralSchemes', 'Central Schemes'), count: schemes.filter(s => s.state === 'Central').length },
          { id: 'State', label: t('stateSchemes', 'State Schemes'), count: schemes.filter(s => s.state !== 'Central').length },
          { id: 'Trending', label: `🔥 ${t('trending', 'Trending')}`, count: schemes.filter(s => s.popularityScore >= 90).length },
          { id: 'Saved', label: `🔖 ${t('saved', 'Saved')}`, count: user.savedSchemeIds.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryTab(tab.id as any)}
            className={`px-4 py-2 rounded text-sm font-bold transition flex items-center gap-1.5 ${activeCategoryTab === tab.id
              ? 'bg-uswds-primary text-white shadow-sm'
              : 'bg-white border border-uswds-border text-uswds-text hover:bg-slate-50'
              }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeCategoryTab === tab.id ? 'bg-uswds-secondary text-white' : 'bg-uswds-background border border-uswds-border text-uswds-textMuted'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="bg-uswds-background border border-uswds-border rounded-md p-4 flex flex-wrap items-center gap-4 text-xs shadow-sm">
        <span className="font-bold text-uswds-primary flex items-center gap-1">
          <SlidersHorizontal className="w-4 h-4" /> {t('filters', 'Filters')}:
        </span>

        {/* State Filter */}
        <select
          value={selectedStateFilter}
          onChange={(e) => setSelectedStateFilter(e.target.value)}
          className="px-3 py-1.5 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary outline-none"
        >
          <option value="All">State: All</option>
          {statesList.filter(s => s !== 'All').map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary outline-none"
        >
          <option value="All">{t('category', 'Category')}: {t('all', 'All')}</option>
          {categoriesList.filter(c => c !== 'All').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Income Range Filter */}
        <select
          value={selectedIncomeFilter}
          onChange={(e) => setSelectedIncomeFilter(e.target.value)}
          className="px-3 py-1.5 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary outline-none"
        >
          <option value="All">{t('income', 'Income')}: {t('all', 'Any')}</option>
          <option value="bpl">BPL (below ₹1.2L)</option>
          <option value="2.5l">Below ₹2.5 Lakh</option>
          <option value="5l">Below ₹5 Lakh</option>
        </select>

        {/* Reset Filters */}
        {(selectedStateFilter !== 'All' || selectedCategoryFilter !== 'All' || selectedIncomeFilter !== 'All' || searchQuery !== '') && (
          <button
            onClick={() => {
              setSelectedStateFilter('All');
              setSelectedCategoryFilter('All');
              setSelectedIncomeFilter('All');
              setSearchQuery('');
            }}
            className="text-uswds-danger font-bold hover:underline ml-auto flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        )}
      </div>

      {/* Scheme Cards Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-white border border-uswds-border shadow-sm rounded-md p-12 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-uswds-warning mx-auto" />
          <h3 className="text-lg font-bold text-uswds-primary font-sans">
            No Government Schemes Found
          </h3>
          <p className="text-sm text-uswds-textMuted max-w-md mx-auto">
            {t('noSchemesFoundDesc', 'Complete your profile or adjust your filters to view personalized welfare recommendations.')}
          </p>
          <button
            onClick={() => {
              setSelectedStateFilter('All');
              setSelectedCategoryFilter('All');
              setActiveCategoryTab('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded bg-uswds-primary text-white font-bold text-sm shadow-sm"
          >
            {t('browseAllSchemes', 'Browse All Schemes')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map(analysis => {
            const { scheme, ruleResult, mlResult } = analysis;
            const bookmarked = isBookmarked(scheme.id);

            return (
              <div
                key={scheme.id}
                className="bg-white border border-uswds-border rounded-md shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition relative group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-uswds-background text-uswds-primary border border-uswds-border text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {scheme.state === 'Central' ? 'Central' : scheme.state}
                      </span>

                      {/* Rule Engine Status Badge */}
                      {ruleResult.status === 'Eligible' && (
                        <span className="bg-green-50 text-uswds-success border border-uswds-success text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" /> {t('eligibleStatus', 'Eligible')}
                        </span>
                      )}
                      {ruleResult.status === 'Conditionally Eligible' && (
                        <span className="bg-yellow-50 text-uswds-warning border border-uswds-warning text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" /> {t('conditionalStatus', 'Conditionally Eligible')}
                        </span>
                      )}
                      {ruleResult.status === 'Not Eligible' && (
                        <span className="bg-slate-50 text-slate-500 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <XCircle className="w-3 h-3 shrink-0" /> {t('notEligibleStatus', 'Not Eligible')}
                        </span>
                      )}
                    </div>

                    {/* Bookmark Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(scheme.id);
                      }}
                      className="p-1 rounded text-uswds-textMuted hover:text-uswds-primary transition"
                      title={bookmarked ? t('removeBookmark', 'Remove Bookmark') : t('saveScheme', 'Save Scheme')}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-uswds-primary text-uswds-primary' : ''}`} />
                    </button>
                  </div>

                  {/* ML Match Confidence Score - Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-uswds-textMuted font-medium">{t('aiMatchConfidence', 'AI Match Confidence')}</span>
                      <span className={`font-bold text-sm font-sans ${mlResult.confidenceScore >= 75 ? 'text-uswds-success' :
                          mlResult.confidenceScore >= 50 ? 'text-uswds-warning' :
                            'text-slate-500'
                        }`}>{mlResult.confidenceScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-uswds-background border border-uswds-border rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${mlResult.confidenceScore >= 75 ? 'bg-uswds-success' :
                            mlResult.confidenceScore >= 50 ? 'bg-uswds-warning' :
                              'bg-slate-400'
                          }`}
                        style={{ width: `${mlResult.confidenceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Scheme Name */}
                  <h3 className="text-base font-bold text-uswds-primary line-clamp-2 font-sans group-hover:underline transition">
                    {scheme.name}
                  </h3>

                  {/* Financial Benefit Amount */}
                  {scheme.financialBenefitAmount && (
                    <div className="text-xs font-bold text-uswds-success">
                      {t('benefitUpTo', 'Benefit: Up to')} ₹{scheme.financialBenefitAmount.toLocaleString('en-IN')}/{t('year', 'year')}
                    </div>
                  )}

                  {/* Short Description */}
                  <p className="text-sm text-uswds-textMuted line-clamp-2 leading-relaxed">
                    {scheme.shortDescription}
                  </p>

                  {/* Why Eligible / Explanation Preview */}
                  <div className="p-2.5 rounded bg-uswds-background border border-uswds-border text-xs text-uswds-text leading-snug">
                    <span className="font-bold text-uswds-primary block mb-1">
                      {t('whyEligible', 'Why am I eligible?')}:
                    </span>
                    <p className="line-clamp-2">{mlResult.matchReason}</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-uswds-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectScheme(analysis)}
                    className="w-full py-2 rounded bg-uswds-primary hover:bg-uswds-secondary text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <span>{t('viewSchemeDetails', 'View Scheme Details')}</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
