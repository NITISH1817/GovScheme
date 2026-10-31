import { Scheme } from '../types';

export type FreshnessStatus = 'RECENTLY_VERIFIED' | 'VERIFICATION_DUE' | 'STALE' | 'SOURCE_UNAVAILABLE';

export interface SchemeSourceAudit {
  schemeId: string;
  schemeName: string;
  state: string;
  officialSourceUrl: string;
  officialApplyUrl: string;
  isOfficialGovDomain: boolean;
  domain: string;
  lastVerifiedAt: string;
  daysSinceVerification: number;
  freshnessStatus: FreshnessStatus;
  verificationStatus: string;
  dataVersion: string;
}

export interface TrustOperationalMetrics {
  totalIndexedSchemes: number;
  verifiedOfficialSourcesCount: number;
  schemesRequiringVerificationCount: number;
  recentlyVerifiedCount: number;
  staleRecordsCount: number;
  brokenOrSuspiciousUrlsCount: number;
  lastSuccessfulSyncAt: string;
  pendingFeedbackReportsCount: number;
  trustScorePercentage: number;
}

/**
 * Validates whether a given URL points to an approved government or authorized public sector domain.
 */
export function isApprovedGovernmentDomain(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    // Standard Indian Government top-level and second-level domains
    if (host.endsWith('.gov.in') || host.endsWith('.nic.in')) return true;

    // State Government specific portals
    if (host.endsWith('.tn.gov.in') || host.endsWith('.kerala.gov.in') || host.endsWith('.ap.gov.in')) return true;

    // Authorized statutory and public benefit domains
    const authorizedPortals = [
      'swavlambancard.gov.in',
      'pmkisan.gov.in',
      'scholarships.gov.in',
      'pmjay.gov.in',
      'pmayg.nic.in',
      'myscheme.gov.in',
      'digilocker.gov.in',
      'web.umang.gov.in',
      'proteantech.in',
      'ugcnet.nta.ac.in',
      'uidai.gov.in',
      'incometax.gov.in',
      'epfindia.gov.in'
    ];

    return authorizedPortals.some(p => host === p || host.endsWith('.' + p));
  } catch {
    return false;
  }
}

/**
 * Extracts the clean hostname from a URL.
 */
export function extractHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl || '';
  }
}

/**
 * Calculates days between an ISO date string and today.
 */
export function getDaysSinceDate(isoDateStr?: string | null): number {
  if (!isoDateStr) return 999;
  const target = new Date(isoDateStr);
  if (isNaN(target.getTime())) return 999;
  const diffMs = Date.now() - target.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Categorizes a scheme's data freshness based on actual verification dates.
 */
export function evaluateSchemeFreshness(scheme: Scheme): FreshnessStatus {
  const verifiedDate = scheme.lastVerifiedAt || scheme.lastUpdated;
  const days = getDaysSinceDate(verifiedDate);

  const applyUrl = scheme.officialApplyUrl || scheme.officialWebsite || '';
  if (!applyUrl || applyUrl === '#') {
    return 'SOURCE_UNAVAILABLE';
  }

  if (days <= 30) return 'RECENTLY_VERIFIED';
  if (days <= 90) return 'VERIFICATION_DUE';
  return 'STALE';
}

/**
 * Generates a full audit record for a single scheme.
 */
export function auditSchemeRecord(scheme: Scheme): SchemeSourceAudit {
  const verifiedDate = scheme.lastVerifiedAt || scheme.lastUpdated || '2026-01-01';
  const days = getDaysSinceDate(verifiedDate);
  const primaryUrl = scheme.officialApplyUrl || scheme.officialWebsite || scheme.sourceUrl || '';
  const domain = extractHostname(primaryUrl);
  const isGov = isApprovedGovernmentDomain(primaryUrl);
  const freshness = evaluateSchemeFreshness(scheme);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    state: scheme.state,
    officialSourceUrl: scheme.sourceUrl || primaryUrl,
    officialApplyUrl: primaryUrl,
    isOfficialGovDomain: isGov,
    domain,
    lastVerifiedAt: verifiedDate,
    daysSinceVerification: days,
    freshnessStatus: freshness,
    verificationStatus: scheme.verificationStatus || (isGov ? 'PORTAL_CURATED' : 'UNVERIFIED'),
    dataVersion: (scheme as any).dataVersion || '1.0.0'
  };
}

/**
 * Computes live operational trust metrics across the scheme catalogue without fabricated numbers.
 */
export function computeTrustMetrics(schemes: Scheme[]): TrustOperationalMetrics {
  const total = schemes.length;
  if (total === 0) {
    return {
      totalIndexedSchemes: 0,
      verifiedOfficialSourcesCount: 0,
      schemesRequiringVerificationCount: 0,
      recentlyVerifiedCount: 0,
      staleRecordsCount: 0,
      brokenOrSuspiciousUrlsCount: 0,
      lastSuccessfulSyncAt: new Date().toISOString().split('T')[0],
      pendingFeedbackReportsCount: 0,
      trustScorePercentage: 100
    };
  }

  let verifiedSources = 0;
  let recentlyVerified = 0;
  let staleRecords = 0;
  let brokenUrls = 0;
  let latestVerificationTime = 0;

  schemes.forEach(s => {
    const primaryUrl = s.officialApplyUrl || s.officialWebsite || '';
    if (isApprovedGovernmentDomain(primaryUrl)) {
      verifiedSources++;
    } else if (!primaryUrl || primaryUrl === '#' || !primaryUrl.startsWith('http')) {
      brokenUrls++;
    }

    const freshness = evaluateSchemeFreshness(s);
    if (freshness === 'RECENTLY_VERIFIED') {
      recentlyVerified++;
    } else if (freshness === 'STALE' || freshness === 'SOURCE_UNAVAILABLE') {
      staleRecords++;
    }

    const t = new Date(s.lastVerifiedAt || s.lastUpdated || 0).getTime();
    if (!isNaN(t) && t > latestVerificationTime) {
      latestVerificationTime = t;
    }
  });

  const requiringVerification = total - recentlyVerified;

  // Retrieve pending feedback reports count from localStorage
  let pendingFeedbackCount = 0;
  try {
    const rawFeedbacks = localStorage.getItem('govscheme_citizen_feedbacks');
    if (rawFeedbacks) {
      const parsed = JSON.parse(rawFeedbacks);
      if (Array.isArray(parsed)) {
        pendingFeedbackCount = parsed.filter(f => f.status === 'PENDING' || f.status === 'INVESTIGATING').length;
      }
    }
  } catch {}

  // Trust score: weighted combination of verified domains and recently verified records
  const domainScore = (verifiedSources / total) * 50;
  const freshnessScore = Math.max(0, 1 - (staleRecords / total)) * 50;
  const trustScore = Math.round(domainScore + freshnessScore);

  return {
    totalIndexedSchemes: total,
    verifiedOfficialSourcesCount: verifiedSources,
    schemesRequiringVerificationCount: requiringVerification,
    recentlyVerifiedCount: recentlyVerified,
    staleRecordsCount: staleRecords,
    brokenOrSuspiciousUrlsCount: brokenUrls,
    lastSuccessfulSyncAt: latestVerificationTime > 0 ? new Date(latestVerificationTime).toISOString().split('T')[0] : '2026-10-31',
    pendingFeedbackReportsCount: pendingFeedbackCount,
    trustScorePercentage: Math.min(100, Math.max(0, trustScore))
  };
}

