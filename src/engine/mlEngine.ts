import { UserProfile, Scheme, RuleEvaluationResult, MLRecommendationResult } from '../types';
import i18n from '../i18n';

/**
 * Machine Learning Recommendation Scoring & Personalization Engine
 * Note: ML enhances ranking, preference matching, explainability, and related scheme recommendation.
 * Legal eligibility remains strictly enforced by the Rule Engine.
 */
export function computeMLRecommendation(
  user: UserProfile,
  scheme: Scheme,
  ruleResult: RuleEvaluationResult,
  allSchemes: Scheme[]
): MLRecommendationResult {
  let score = 50; // Base baseline score

  // 1. Rule Engine Weight Boost / Penalty
  if (ruleResult.status === 'Eligible') {
    score += 35;
  } else if (ruleResult.status === 'Conditionally Eligible') {
    score += 20;
  } else {
    score -= 30; // Significant penalty for non-eligible schemes
  }

  // 2. Category & Occupation Affinity Boost
  if (user.occupation.toLowerCase().includes('farmer') && scheme.category.includes('Agriculture')) {
    score += 10;
  }
  if (user.hasDisability && scheme.category.includes('Disability')) {
    score += 15;
  }
  if (user.gender === 'Female' && scheme.category.includes('Women')) {
    score += 10;
  }
  if (user.age >= 60 && scheme.category.includes('Pension')) {
    score += 10;
  }

  // 3. Financial Impact Weight (Normalize benefit amount)
  if (scheme.financialBenefitAmount) {
    if (scheme.financialBenefitAmount >= 100000) {
      score += 8;
    } else if (scheme.financialBenefitAmount >= 10000) {
      score += 4;
    }
  }

  // 4. Popularity & State Preference
  if (scheme.state.toLowerCase() === user.state.toLowerCase()) {
    score += 5;
  }
  score += Math.round((scheme.popularityScore ?? 80) * 0.05);

  // Clamp Score 0 - 99%
  const confidenceScore = Math.min(Math.max(Math.round(score), 10), 99);

  // Determine Urgency
  let urgencyLevel: 'High' | 'Medium' | 'Standard' = 'Standard';
  if (confidenceScore >= 85) urgencyLevel = 'High';
  else if (confidenceScore >= 65) urgencyLevel = 'Medium';

  // Generate Natural Language Match Explanation
  const matchReason = generateExplainabilityText(user, scheme, ruleResult, confidenceScore);

  // Discover Related Schemes in same category or target
  const relatedSchemeIds = allSchemes
    .filter(s => s.id !== scheme.id && (s.category === scheme.category || s.state === scheme.state))
    .slice(0, 3)
    .map(s => s.id);

  return {
    schemeId: scheme.id,
    confidenceScore,
    matchReason,
    urgencyLevel,
    relatedSchemeIds
  };
}

function generateExplainabilityText(
  user: UserProfile,
  scheme: Scheme,
  ruleResult: RuleEvaluationResult,
  score: number
): string {
  if (ruleResult.status === 'Eligible') {
    return i18n.t('reasonEligible', {
      defaultValue: `Highly recommended ({{score}}% match score). You satisfy all legal criteria as a {{occupation}} residing in {{state}}. Financial benefit of ₹{{benefit}} available upon application.`,
      score,
      occupation: i18n.t(user.occupation, user.occupation),
      state: i18n.t(user.state, user.state),
      benefit: (scheme.financialBenefitAmount || 0).toLocaleString('en-IN')
    });
  } else if (ruleResult.status === 'Conditionally Eligible') {
    const docs = ruleResult.missingDocuments.map(d => i18n.t(d, d)).join(', ');
    return i18n.t('reasonConditional', {
      defaultValue: `Strong recommendation ({{score}}% match score). Your profile meets criteria, but you need to upload {{docs}} to complete verification before submitting on the official portal.`,
      score,
      docs
    });
  } else {
    const criteria = ruleResult.failedCriteria.slice(0, 2).map(c => i18n.t(c, c)).join(', ');
    return i18n.t('reasonNotEligible', {
      defaultValue: `Low match score ({{score}}%). Does not satisfy core requirements: {{criteria}}.`,
      score,
      criteria
    });
  }
}

/**
 * Ranks all schemes combining Rule Engine + ML Scores
 */
export function rankSchemesForUser(user: UserProfile, schemes: Scheme[], ruleResultsMap: Record<string, RuleEvaluationResult>) {
  return schemes
    .map(scheme => {
      const ruleResult = ruleResultsMap[scheme.id];
      const mlResult = computeMLRecommendation(user, scheme, ruleResult, schemes);
      return {
        scheme,
        ruleResult,
        mlResult
      };
    })
    .sort((a, b) => b.mlResult.confidenceScore - a.mlResult.confidenceScore);
}
