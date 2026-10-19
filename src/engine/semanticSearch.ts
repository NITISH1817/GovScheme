import type { Scheme } from '../types/index.ts';

// Common English and domain-agnostic stop words
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'to', 'in', 'of', 'and', 'or', 'is', 'are', 'on', 'at', 'by',
  'with', 'from', 'as', 'about', 'into', 'through', 'after', 'before', 'my', 'me', 'i',
  'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'who', 'which', 'what',
  'where', 'when', 'how', 'why', 'can', 'could', 'should', 'would', 'will', 'do', 'does',
  'did', 'have', 'has', 'had', 'get', 'give', 'want', 'need', 'apply', 'please', 'tell',
  'show', 'find', 'search', 'any', 'all', 'some', 'me'
]);

// Generic domain designators that citizens use
const DOMAIN_DESIGNATORS = new Set([
  'scheme', 'schemes', 'yojana', 'yojna', 'sarkari', 'government', 'govt'
]);

// Carefully curated domain synonym expansion for Indian government welfare schemes
const SYNONYM_MAP: Record<string, string[]> = {
  // Farmer / Agriculture
  farmer: ['agriculture', 'kisan', 'farming', 'crop', 'crops', 'cultivator', 'krishi', 'subsidy', 'fertilizer', 'rythu'],
  farmers: ['agriculture', 'kisan', 'farming', 'crop', 'crops', 'cultivator', 'krishi', 'subsidy'],
  agriculture: ['farmer', 'kisan', 'farming', 'crop', 'crops', 'cultivator', 'krishi'],
  kisan: ['farmer', 'agriculture', 'farming', 'crop', 'cultivator', 'krishi', 'pm-kisan'],
  krishi: ['farmer', 'agriculture', 'kisan', 'farming'],
  crop: ['farmer', 'agriculture', 'kisan', 'harvest', 'fasal', 'bima'],
  crops: ['farmer', 'agriculture', 'kisan', 'harvest', 'fasal', 'bima'],
  subsidy: ['assistance', 'grant', 'aid', 'financial', 'subsidy', 'discount'],

  // Student / Scholarship / Education
  student: ['scholarship', 'education', 'school', 'college', 'tuition', 'matric', 'post-matric', 'study', 'fellowship', 'stipend', 'vidya', 'shiksha'],
  students: ['scholarship', 'education', 'school', 'college', 'tuition', 'matric', 'study', 'fellowship'],
  scholarship: ['student', 'education', 'fellowship', 'stipend', 'tuition', 'matric', 'vidya', 'shiksha'],
  education: ['student', 'scholarship', 'school', 'college', 'university', 'tuition', 'vidya', 'shiksha'],
  school: ['education', 'student', 'scholarship', 'shiksha'],
  college: ['higher education', 'student', 'scholarship', 'degree', 'post-matric'],

  // Pension / Senior / Elderly
  pension: ['senior', 'elderly', 'old age', 'vridha', 'retirement', 'atal pension', 'apy', 'oap'],
  senior: ['pension', 'elderly', 'old age', 'vridha', 'aging'],
  elderly: ['pension', 'senior', 'old age', 'vridha'],
  retirement: ['pension', 'senior', 'provident', 'superannuation'],

  // Disability / Divyang
  disability: ['disabled', 'divyang', 'handicapped', 'pwd', 'special need', 'impairment', 'prosthetic', 'wheelchair', 'assistive'],
  disabled: ['disability', 'divyang', 'handicapped', 'pwd'],
  divyang: ['disability', 'disabled', 'pwd', 'handicapped'],
  pwd: ['disability', 'disabled', 'divyang'],

  // Housing / Shelter
  housing: ['house', 'home', 'shelter', 'awas', 'pmay', 'pucca', 'residential', 'slum', 'flat', 'allotment'],
  house: ['housing', 'home', 'shelter', 'awas', 'pmay'],
  home: ['housing', 'house', 'shelter', 'awas'],
  awas: ['housing', 'house', 'shelter', 'pmay'],
  shelter: ['housing', 'house', 'home', 'residence'],

  // Health / Medical
  health: ['healthcare', 'medical', 'hospital', 'treatment', 'ayushman', 'pmjay', 'insurance', 'medicine', 'arogya', 'swasthya'],
  healthcare: ['health', 'medical', 'hospital', 'insurance', 'ayushman', 'pmjay', 'treatment'],
  medical: ['health', 'healthcare', 'hospital', 'treatment', 'doctor', 'clinic', 'ayushman'],
  hospital: ['health', 'medical', 'treatment', 'ayushman', 'pmjay'],
  insurance: ['health', 'bima', 'suraksha', 'ayushman', 'coverage'],

  // Women / Child / Maternity
  women: ['woman', 'female', 'girl', 'mother', 'maternity', 'mahila', 'beti', 'widow', 'sukanya', 'ladli'],
  woman: ['women', 'female', 'girl', 'mother', 'mahila'],
  female: ['women', 'woman', 'girl', 'mahila'],
  girl: ['women', 'female', 'beti', 'child', 'sukanya'],
  maternity: ['mother', 'pregnancy', 'women', 'childbirth', 'matru'],
  widow: ['women', 'destitute', 'pension'],

  // Employment / Jobs / Micro Enterprise
  job: ['employment', 'work', 'unemployed', 'rozhgar', 'mgnrega', 'nrega', 'livelihood', 'skill', 'training'],
  jobs: ['employment', 'work', 'unemployed', 'rozhgar', 'mgnrega', 'nrega'],
  employment: ['job', 'work', 'unemployed', 'rozhgar', 'livelihood', 'skill', 'mgnrega'],
  work: ['employment', 'job', 'labor', 'shramik', 'mgnrega'],
  loan: ['credit', 'business', 'mudra', 'startup', 'finance', 'subsidy', 'microfinance', 'svanidhi'],
  business: ['loan', 'credit', 'enterprise', 'msme', 'mudra', 'startup', 'entrepreneur'],
  vendor: ['street vendor', 'svanidhi', 'loan', 'hawker', 'micro credit']
};

/**
 * Normalizes text by lowercasing and stripping punctuation.
 */
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts substantive search tokens from normalized text, applying stop-word elimination.
 */
function extractTokens(normalized: string): { substantive: string[]; domain: string[]; allRaw: string[] } {
  const parts = normalized.split(/[\s-]+/).filter(t => t.length > 1);
  const substantive: string[] = [];
  const domain: string[] = [];

  for (const p of parts) {
    if (DOMAIN_DESIGNATORS.has(p)) {
      domain.push(p);
    } else if (!STOP_WORDS.has(p)) {
      substantive.push(p);
    }
  }

  return { substantive, domain, allRaw: parts };
}

/**
 * Expands search tokens with domain synonyms.
 */
function expandWithSynonyms(tokens: string[]): { primary: string[]; synonyms: string[] } {
  const primarySet = new Set(tokens);
  const synonymSet = new Set<string>();

  for (const token of tokens) {
    const list = SYNONYM_MAP[token];
    if (list) {
      for (const syn of list) {
        if (!primarySet.has(syn)) {
          synonymSet.add(syn);
        }
      }
    }
  }

  return {
    primary: Array.from(primarySet),
    synonyms: Array.from(synonymSet)
  };
}

/**
 * Deterministic, weighted lexical search engine for the 75-scheme catalogue.
 * Replaces simulated network latency and artificial random jitter with:
 * - Case & punctuation normalization
 * - Stop-word removal
 * - Curated domain synonym expansion
 * - Multi-field weighted relevance scoring (name, category, tags, description, eligibility)
 * - 100% deterministic, stable tie-breaking
 */
export const performSemanticSearch = async (
  query: string,
  schemes: Scheme[]
): Promise<{ scheme: Scheme; score: number }[]> => {
  const rawTrimmed = (query || '').trim();

  // 1. Empty query returns full catalog with score 1.0 (deterministic baseline)
  if (!rawTrimmed) {
    return schemes.map(s => ({ scheme: s, score: 1.0 }));
  }

  const normalizedQuery = normalizeText(rawTrimmed);
  const { substantive, domain, allRaw } = extractTokens(normalizedQuery);

  // 2. Query consisting ONLY of generic stop words (e.g., "the for and") with no domain terms -> empty results
  if (substantive.length === 0 && domain.length === 0) {
    return [];
  }

  // 3. Query containing ONLY domain terms (e.g., "sarkari yojana", "schemes") -> return all schemes with neutral score
  if (substantive.length === 0 && domain.length > 0) {
    return schemes.map(s => ({ scheme: s, score: 0.85 }));
  }

  // 4. Expand substantive search terms with curated synonyms
  const { primary, synonyms } = expandWithSynonyms(substantive);

  // 5. Score every scheme deterministically against multi-field weights
  const results = schemes.map(scheme => {
    const nameNorm = normalizeText(scheme.name || '');
    const catNorm = normalizeText(scheme.category || '');
    const tagsNorm = normalizeText((scheme.tags || []).join(' '));
    const descNorm = normalizeText(`${scheme.shortDescription || ''} ${scheme.detailedDescription || ''} ${scheme.benefitsSummary || ''}`);
    const deptNorm = normalizeText(`${scheme.department || ''} ${scheme.ministry || ''}`);
    
    // Eligibility criteria fields
    const rules = scheme.eligibilityRules || {};
    const eligNorm = normalizeText([
      ...(rules.allowedOccupations || []),
      ...(rules.allowedCategories || []),
      ...(rules.allowedStates || []),
      ...(rules.requiredDocuments || []),
      rules.requiresDisability ? 'disability divyang pwd' : ''
    ].join(' '));

    let rawScore = 0;

    // Exact whole query match boosts
    if (nameNorm === normalizedQuery) {
      rawScore += 5.0; // Perfect exact name match
    } else if (nameNorm.includes(normalizedQuery)) {
      rawScore += 2.5; // Complete phrase contained in name
    } else if (normalizedQuery.includes(nameNorm)) {
      rawScore += 2.0; // Name contained in query
    } else if (descNorm.includes(normalizedQuery) || catNorm.includes(normalizedQuery)) {
      rawScore += 1.0; // Complete phrase in description/category
    }

    // Direct substantive token matching across weighted fields
    let directMatches = 0;
    for (const token of primary) {
      let matchedToken = false;
      if (nameNorm.includes(token)) {
        rawScore += 0.60;
        matchedToken = true;
      }
      if (catNorm.includes(token)) {
        rawScore += 0.35;
        matchedToken = true;
      }
      if (tagsNorm.includes(token)) {
        rawScore += 0.30;
        matchedToken = true;
      }
      if (eligNorm.includes(token)) {
        rawScore += 0.20;
        matchedToken = true;
      }
      if (descNorm.includes(token)) {
        rawScore += 0.15;
        matchedToken = true;
      }
      if (deptNorm.includes(token)) {
        rawScore += 0.10;
        matchedToken = true;
      }
      if (matchedToken) directMatches++;
    }

    // Bonus for high query token coverage (all user search words matched)
    if (primary.length > 0) {
      const coverage = directMatches / primary.length;
      rawScore += coverage * 0.50;
    }

    // Synonym matching (applied with discount to prioritize exact lexical matches)
    for (const syn of synonyms) {
      if (nameNorm.includes(syn)) {
        rawScore += 0.25;
      } else if (catNorm.includes(syn) || tagsNorm.includes(syn)) {
        rawScore += 0.18;
      } else if (eligNorm.includes(syn) || descNorm.includes(syn)) {
        rawScore += 0.10;
      }
    }

    // State match boost if scheme state matches query
    if (scheme.state && scheme.state !== 'Central') {
      const stateNorm = normalizeText(scheme.state);
      if (normalizedQuery.includes(stateNorm)) {
        rawScore += 0.30;
      }
    }

    return { scheme, rawScore };
  });

  // Filter out schemes below relevance threshold
  const filtered = results.filter(r => r.rawScore >= 0.20);
  if (filtered.length === 0) {
    return [];
  }

  // Sort deterministically by rawScore descending, tie-breaking alphabetically
  filtered.sort((a, b) => {
    if (Math.abs(b.rawScore - a.rawScore) > 0.0001) {
      return b.rawScore - a.rawScore;
    }
    const nameComp = a.scheme.name.localeCompare(b.scheme.name);
    if (nameComp !== 0) return nameComp;
    return a.scheme.id.localeCompare(b.scheme.id);
  });

  // Normalize scores to [0.10, 0.99] range while preserving rank order
  const maxScore = filtered[0].rawScore;
  const ranked = filtered.map(item => {
    // Top result gets scaled relative to its quality (min 0.85 if exact phrase, else proportional)
    const ratio = maxScore > 0 ? item.rawScore / maxScore : 0;
    const score = Math.min(0.99, Math.max(0.10, Math.round((0.50 + ratio * 0.49) * 100) / 100));
    return { scheme: item.scheme, score };
  });

  return ranked;
};

