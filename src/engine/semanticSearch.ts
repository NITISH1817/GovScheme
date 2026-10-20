import type { Scheme } from '../types/index.ts';

// Common English and domain-agnostic stop words
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'to', 'in', 'of', 'and', 'or', 'is', 'are', 'on', 'at', 'by',
  'with', 'from', 'as', 'about', 'into', 'through', 'after', 'before', 'my', 'me', 'i',
  'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'who', 'which', 'what',
  'where', 'when', 'how', 'why', 'can', 'could', 'should', 'would', 'will', 'do', 'does',
  'did', 'have', 'has', 'had', 'get', 'give', 'want', 'need', 'apply', 'please', 'tell',
  'show', 'find', 'search', 'any', 'all', 'some',
  // Demonstratives and relational particles
  'this', 'that', 'these', 'those',
  // Standalone negative particles and meta-words (never meaningful standalone scheme keywords)
  'non', 'not', 'no', 'none', 'neither', 'nor', 'query', 'queries', 'existent', 'existing', 'exist', 'exists',
  'fake', 'bogus', 'hoax', 'fraud', 'fraudulent', 'scam', 'scams'
]);

// Generic domain designators that citizens use
const DOMAIN_DESIGNATORS = new Set([
  'scheme', 'schemes', 'yojana', 'yojna', 'sarkari', 'government', 'govt'
]);

// Generic document designators that citizens use
const DOCUMENT_DESIGNATORS = new Set([
  'certificate', 'certificates', 'proof', 'document', 'documents'
]);

// Flagship authentic central schemes with verified portals & helplines used for fraud-awareness guidance
const AUTHENTIC_REFERENCE_IDS = ['pm-kisan', 'pmjay-ayushman', 'post-matric-scholarship', 'udid-disability-scheme'];

/**
 * Detects whether a query is a legitimate citizen fraud-awareness, website verification,
 * or scam-reporting query.
 */
function isFraudAwarenessQuery(normalized: string): boolean {
  return (
    // "How can I identify a fake government scheme?", "how to spot fake schemes"
    /\b(?:how\s+(?:can\s+i|do\s+i|to)|identify|spot|recognize|distinguish|detect|tell\s+if|know\s+if)\b.*\b(?:fake|fraud|fraudulent|scam|bogus|genuine|authentic)\b/i.test(normalized) ||
    // "How do I report a fraudulent scheme?", "where to report fake scheme"
    /\b(?:how\s+(?:can\s+i|do\s+i|to)|where\s+(?:can\s+i|do\s+i|to)|report|complain|complaint|grievance|helpline)\b.*\b(?:fake|fraud|fraudulent|scam|bogus)\b/i.test(normalized) ||
    // "Is this PM-KISAN website fake?", "is this portal fake", "verify website"
    /\b(?:is\s+(?:this|it)|are\s+these|check|verify|genuine|authentic|official)\b.*\b(?:website|portal|link|url|site|call|sms|message)\b/i.test(normalized) ||
    /\b(?:is\s+(?:this|it)|are\s+these)\b.*\b(?:fake|scam|fraudulent|bogus)\b/i.test(normalized) ||
    /\b(?:fake|fraudulent|scam)\b.*\b(?:website|portal|link|url)\b/i.test(normalized)
  );
}

/**
 * Detects whether a query is an explicit request to find or list fake or nonexistent schemes.
 */
function isExplicitNonexistentQuery(normalized: string): boolean {
  // Explicit commands asking to show, list, find, or search fake/nonexistent schemes
  if (/\b(?:show|find|list|search|give|get|display)\b.*\b(?:fake|bogus|non[-\s]?existent)\b.*\b(?:scheme|schemes|yojana)\b/i.test(normalized)) {
    return true;
  }
  // "fake schemes that do not exist", "schemes that do not exist"
  if (/\b(?:fake|bogus|non[-\s]?existent)?\s*(?:schemes?|yojanas?)\s+(?:that|which)?\s*(?:do\s+not\s+exist|dont\s+exist|does\s+not\s+exist)\b/i.test(normalized)) {
    return true;
  }
  // Generic standalone nonexistent markers
  if (/\bnon[-\s]?existent\b/i.test(normalized) || /\bnon[-\s]?existing\b/i.test(normalized)) {
    return true;
  }
  // Fake scheme with fictitious name (e.g. "fake scheme xyz", "bogus scheme abc")
  if (/\b(?:fake|bogus)\s+(?:scheme|yojana)\s+[a-z0-9_-]+/i.test(normalized)) {
    return true;
  }
  // Pure "fake scheme", "fake schemes", "fake yojana"
  if (/^(?:fake|bogus)\s+(?:scheme|schemes|yojana|yojanas)$/i.test(normalized)) {
    return true;
  }
  // "fake PM-KISAN" or "fake loan"
  if (/^fake\s+[a-z0-9_-]+$/i.test(normalized)) {
    return true;
  }
  return false;
}

// Action words used in fraud inquiry/reporting that should not be matched as scheme eligibility keywords
const FRAUD_AWARENESS_ACTION_WORDS = new Set([
  'report', 'reporting', 'identify', 'identifying', 'spot', 'spotting', 'check', 'checking',
  'verify', 'verifying', 'tell', 'know', 'detect', 'detecting', 'recognize', 'recognizing'
]);

// Meaningful multi-word compounds to canonicalize before token extraction
const COMPOUND_CANONICALIZATIONS: [RegExp, string][] = [
  [/\bnon\s+creamy\b/gi, 'non-creamy'],
  [/\bnon\s+farm\b/gi, 'non-farm'],
  [/\bpost\s+matric\b/gi, 'post-matric'],
  [/\bpre\s+matric\b/gi, 'pre-matric'],
  [/\bpm\s+kisan\b/gi, 'pm-kisan'],
  [/\bpm\s+jay\b/gi, 'pm-jay'],
  [/\bpm\s+mudra\b/gi, 'pm-mudra'],
  [/\bpm\s+svanidhi\b/gi, 'pm-svanidhi'],
  [/\bpm\s+ujjwala\b/gi, 'pm-ujjwala'],
  [/\bpm\s+vishwakarma\b/gi, 'pm-vishwakarma'],
  [/\bpm\s+fasal\b/gi, 'pm-fasal'],
  [/\bold\s+age\b/gi, 'old-age'],
  [/\bself\s+employed\b/gi, 'self-employed'],
  [/\bstand\s+up\b/gi, 'stand-up']
];

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
 * Normalizes text by lowercasing, stripping unsupported punctuation,
 * and canonicalizing compound terms while preserving hyphenated words.
 */
function normalizeText(text: string): string {
  if (!text) return '';
  let norm = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [pattern, replacement] of COMPOUND_CANONICALIZATIONS) {
    norm = norm.replace(pattern, replacement);
  }

  return norm;
}

/**
 * Detects negative state/location modifiers (e.g. "not available in Tamil Nadu", "not in Tamil Nadu", "outside Tamil Nadu").
 */
function extractNegativeState(normalized: string): string | null {
  const match = normalized.match(/\b(?:not\s+available\s+in|not\s+in|outside|other\s+than)\s+([a-z\s]+?)(?:\s+state|\s+district|\s+region|$)/i);
  if (match) {
    const candidate = match[1].trim();
    if (candidate.includes('tamil nadu') || candidate.includes('tamilnadu') || candidate === 'tn') return 'tamil nadu';
    if (candidate.includes('uttar pradesh') || candidate === 'up') return 'uttar pradesh';
    if (candidate.includes('telangana')) return 'telangana';
    if (candidate.includes('karnataka')) return 'karnataka';
  }
  return null;
}

/**
 * Detects negative document requirement modifiers (e.g. "do not require an income certificate", "without income certificate").
 */
function extractNegativeDocRequirement(normalized: string): string | null {
  const match = normalized.match(/\b(?:do\s+not\s+require|does\s+not\s+require|not\s+requiring|without|no)\s+(?:an?\s+)?([\w\s-]+?)(?:\s+certificate|\s+proof|\s+card|\s+doc|\s+document)?(?:\s+required)?(?:\s+scheme|\s+schemes|$)/i);
  if (match) {
    const term = match[1].trim();
    if (term.includes('income')) return 'income';
    if (term.includes('caste')) return 'caste';
    if (term.includes('aadhaar')) return 'aadhaar';
    if (term.includes('ration')) return 'ration';
    if (term.includes('land')) return 'land';
    if (term.includes('disability')) return 'disability';
    if (term.includes('domicile')) return 'domicile';
  }
  return null;
}

/**
 * Safely extracts and normalizes document names from an arbitrary document list,
 * handling missing fields, null/undefined entries, and non-string types.
 */
function extractDocList(docs: unknown): string[] {
  if (!Array.isArray(docs)) return [];
  return docs
    .filter((d): d is string => typeof d === 'string')
    .map(d => d.toLowerCase().trim());
}

/**
 * Extracts substantive search tokens from normalized text, applying stop-word and designator elimination.
 * Splits on whitespace to preserve hyphenated terms (e.g. "non-creamy", "pm-kisan", "post-matric").
 */
function extractTokens(normalized: string): { substantive: string[]; domain: string[]; docDesignators: string[]; allRaw: string[] } {
  const parts = normalized.split(/\s+/).filter(t => t.length > 1);
  const substantive: string[] = [];
  const domain: string[] = [];
  const docDesignators: string[] = [];

  for (const p of parts) {
    if (DOMAIN_DESIGNATORS.has(p)) {
      domain.push(p);
    } else if (DOCUMENT_DESIGNATORS.has(p)) {
      docDesignators.push(p);
    } else if (!STOP_WORDS.has(p)) {
      substantive.push(p);
    }
  }

  return { substantive, domain, docDesignators, allRaw: parts };
}

/**
 * Checks whether a normalized field contains a token, preventing standalone
 * negative particles (such as "non") from matching inside compound terms.
 */
function fieldMatches(fieldNorm: string, token: string): boolean {
  if (!fieldNorm || !token) return false;
  if (token === 'non') return false;
  return fieldNorm.includes(token);
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
 * - Stop-word and designator removal
 * - Curated domain synonym expansion
 * - Negative modifier processing (location and document requirements)
 * - Multi-field weighted relevance scoring (name, category, tags, description, eligibility)
 * - Calibrated confidence scaling to prevent misleading scores on incidental matches
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

  // 2. Explicit requests to find nonexistent or fake schemes safely return empty results
  if (isExplicitNonexistentQuery(normalizedQuery)) {
    return [];
  }

  const fraudAwareness = isFraudAwarenessQuery(normalizedQuery);

  // 3. Extract negative modifiers that alter the intent of the query
  const negativeState = extractNegativeState(normalizedQuery);
  const negativeDoc = extractNegativeDocRequirement(normalizedQuery);

  const { substantive, domain, docDesignators } = extractTokens(normalizedQuery);

  // Substantive tokens take priority over generic document designators
  const targetTokens = substantive.length > 0 ? substantive : docDesignators;

  // Filter out negative terms and fraud action words from positive token matching so they don't reward the negated attribute or match irrelevant document names
  const activeTokens = targetTokens.filter(t => {
    if (negativeState && negativeState.includes(t)) return false;
    if (negativeDoc && t.includes(negativeDoc)) return false;
    if (fraudAwareness && FRAUD_AWARENESS_ACTION_WORDS.has(t)) return false;
    return true;
  });

  // 4. Query consisting ONLY of generic stop words with no negative constraints or fraud awareness -> empty results
  if (activeTokens.length === 0 && domain.length === 0 && !negativeState && !negativeDoc && !fraudAwareness) {
    return [];
  }

  // 5. Query consisting of fraud-awareness inquiry with no specific target scheme -> return authentic reference schemes
  if (activeTokens.length === 0 && fraudAwareness) {
    const refSchemes = schemes.filter(s => AUTHENTIC_REFERENCE_IDS.includes(s.id));
    return refSchemes.map(s => ({ scheme: s, score: 0.75 }));
  }

  // 6. Query containing ONLY domain terms -> return all schemes with neutral score 0.85
  if (activeTokens.length === 0 && domain.length > 0 && !negativeState && !negativeDoc) {
    return schemes.map(s => ({ scheme: s, score: 0.85 }));
  }

  // 6. Expand substantive search terms with curated synonyms
  const { primary, synonyms } = expandWithSynonyms(activeTokens);

  // 7. Score every scheme deterministically against multi-field weights
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
    let hasCoreMatch = false;

    // Exact whole query match boosts
    if (nameNorm === normalizedQuery) {
      rawScore += 5.0; // Perfect exact name match
      hasCoreMatch = true;
    } else if (nameNorm.includes(normalizedQuery)) {
      rawScore += 2.5; // Complete phrase contained in name
      hasCoreMatch = true;
    } else if (normalizedQuery.includes(nameNorm)) {
      rawScore += 2.0; // Name contained in query
      hasCoreMatch = true;
    } else if (descNorm.includes(normalizedQuery) || catNorm.includes(normalizedQuery) || eligNorm.includes(normalizedQuery)) {
      rawScore += 1.0; // Complete phrase in description/category/eligibility
      if (catNorm.includes(normalizedQuery) || eligNorm.includes(normalizedQuery)) hasCoreMatch = true;
    }

    // Direct substantive token matching across weighted fields
    let directMatches = 0;
    for (const token of primary) {
      let matchedToken = false;
      if (fieldMatches(nameNorm, token)) {
        rawScore += 0.60;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(catNorm, token)) {
        rawScore += 0.35;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(tagsNorm, token)) {
        rawScore += 0.30;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(eligNorm, token)) {
        rawScore += 0.20;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(descNorm, token)) {
        rawScore += 0.15;
        matchedToken = true;
      }
      if (fieldMatches(deptNorm, token)) {
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
      if (fieldMatches(nameNorm, syn)) {
        rawScore += 0.25;
      } else if (fieldMatches(catNorm, syn) || fieldMatches(tagsNorm, syn)) {
        rawScore += 0.18;
      } else if (fieldMatches(eligNorm, syn) || fieldMatches(descNorm, syn)) {
        rawScore += 0.10;
      }
    }

    // State matching (Handling negative state vs positive state match)
    if (negativeState) {
      if (scheme.state && scheme.state.toLowerCase() === negativeState) {
        // Explicitly penalize schemes from the negated state
        rawScore -= 2.0;
      } else if (scheme.state === 'Central' || (scheme.state && scheme.state.toLowerCase() !== negativeState)) {
        // Boost schemes available outside the negated state
        rawScore += 0.60;
      }
    } else if (scheme.state && scheme.state !== 'Central') {
      const stateNorm = normalizeText(scheme.state);
      if (normalizedQuery.includes(stateNorm)) {
        rawScore += 0.30;
      }
    }

    // Document requirement matching (Handling negative doc requirement vs positive doc requirement)
    if (negativeDoc) {
      const ruleDocs = extractDocList(rules.requiredDocuments);
      const topDocs = extractDocList(scheme.requiredDocuments);
      const allDocs = [...ruleDocs, ...topDocs];
      const requiresDoc = allDocs.some(d => d.includes(negativeDoc));
      if (requiresDoc) {
        // Scheme requires the negated document -> penalize
        rawScore -= 1.50;
      } else {
        // Scheme does NOT require the negated document -> reward
        rawScore += 0.70;
      }
    }

    return { scheme, rawScore, hasCoreMatch };
  });

  // Filter out schemes below relevance threshold
  const filtered = results.filter(r => r.rawScore >= 0.20);
  if (filtered.length === 0) {
    if (fraudAwareness) {
      const refSchemes = schemes.filter(s => AUTHENTIC_REFERENCE_IDS.includes(s.id));
      return refSchemes.map(s => ({ scheme: s, score: 0.75 }));
    }
    return [];
  }

  // If query is fraud awareness but matched only incidental description noise, supply authoritative guidance
  if (fraudAwareness && !filtered[0].hasCoreMatch && filtered[0].rawScore < 0.60) {
    const refSchemes = schemes.filter(s => AUTHENTIC_REFERENCE_IDS.includes(s.id));
    return refSchemes.map(s => ({ scheme: s, score: 0.75 }));
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

  // Normalize scores to [0.10, 0.99] range while preserving rank order and confidence calibration
  const maxScore = filtered[0].rawScore;
  const topHasCoreMatch = filtered[0].hasCoreMatch;

  // Calibrate top result confidence based on true match quality (prevents misleading high confidence on weak/incidental matches)
  let confidenceCeiling = 0.99;
  if (!topHasCoreMatch && !negativeDoc && !negativeState) {
    confidenceCeiling = 0.50; // Incidental matches in secondary fields only (no name/cat/tag/eligibility hit)
  } else if (maxScore < 0.60) {
    confidenceCeiling = 0.50; // Low confidence for weak matches
  } else if (maxScore < 1.0) {
    confidenceCeiling = 0.75; // Moderate confidence
  } else if (maxScore < 1.40) {
    confidenceCeiling = 0.88; // Good confidence
  }

  const ranked = filtered.map(item => {
    const ratio = maxScore > 0 ? item.rawScore / maxScore : 0;
    const baseScore = 0.35 + ratio * (confidenceCeiling - 0.35);
    const score = Math.min(confidenceCeiling, Math.max(0.10, Math.round(baseScore * 100) / 100));
    return { scheme: item.scheme, score };
  });

  return ranked;
};

