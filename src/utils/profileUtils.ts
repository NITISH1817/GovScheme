import type { UserProfile, TargetGender, CategorySocial } from '../types/index.ts';

export const calculateProfileCompletion = (user: Partial<UserProfile> | any): number => {
  if (!user) return 0;
  const u = (user.profile && typeof user.profile === 'object') ? { ...user, ...user.profile } : user;
  
  const fieldsToTrack = [
    { key: 'fullName', weight: 10 },
    { key: 'mobile', weight: 10 },
    { key: 'age', weight: 10, isNumber: true },
    { key: 'gender', weight: 10 },
    { key: 'state', weight: 10 },
    { key: 'district', weight: 10 },
    { key: 'occupation', weight: 15 },
    { key: 'annualIncome', weight: 15, isIncome: true },
    { key: 'educationLevel', weight: 10 }
  ];

  let score = 0;
  
  fieldsToTrack.forEach(field => {
    const value = u[field.key as keyof UserProfile];
    if (field.isNumber) {
      if (typeof value === 'number' && !isNaN(value) && value > 0) {
        score += field.weight;
      }
    } else if (field.isIncome) {
      if (value !== undefined && value !== null && value !== '' && !isNaN(Number(value))) {
        score += field.weight;
      }
    } else {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        score += field.weight;
      }
    }
  });

  return Math.min(100, score);
};

export const getMissingProfileFields = (user: Partial<UserProfile> | null | undefined): string[] => {
  if (!user) return ['Full Name', 'Age', 'Gender', 'State', 'District', 'Occupation', 'Annual Income', 'Category'];
  const rawObj = user as any;
  const u = (rawObj.profile && typeof rawObj.profile === 'object') ? { ...user, ...rawObj.profile } : user;
  const missing: string[] = [];

  if (!u.fullName || !String(u.fullName).trim()) missing.push('Full Name');
  if (u.age === undefined || u.age === null || isNaN(Number(u.age)) || Number(u.age) <= 0) missing.push('Age');
  if (!u.gender || !String(u.gender).trim()) missing.push('Gender');
  if (!u.state || !String(u.state).trim()) missing.push('State');
  if (!u.district || !String(u.district).trim()) missing.push('District');
  if (u.annualIncome === undefined || u.annualIncome === null || String(u.annualIncome).trim() === '' || isNaN(Number(u.annualIncome))) missing.push('Annual Income');
  if (!u.category || !String(u.category).trim()) missing.push('Category');
  if (!u.occupation || !String(u.occupation).trim()) missing.push('Occupation');

  return missing;
};

export const isProfileComplete = (user: Partial<UserProfile> | null | undefined): boolean => {
  return getMissingProfileFields(user).length === 0;
};

export const normalizeUserProfile = (data: any, fallbackName = '', fallbackEmail = ''): UserProfile => {
  if (!data) {
    return {
      id: `user-${Date.now()}`,
      fullName: fallbackName || 'Citizen User',
      mobile: '+91 98402 12345',
      email: fallbackEmail,
      age: 28,
      gender: 'Male' as TargetGender,
      maritalStatus: 'Single',
      state: 'Tamil Nadu',
      district: 'Chennai',
      category: 'OBC' as CategorySocial,
      occupation: 'Salaried Employee',
      annualIncome: 180000,
      landHoldingAcres: 0,
      educationLevel: 'Graduate',
      familyMembersCount: 4,
      hasDisability: false,
      disabilityPercentage: 0,
      isRegisteredWorker: false,
      verificationBadge: true,
      profileCompletionScore: 100,
      savedSchemeIds: ['pm-kisan', 'pmay-g', 'tn-pudhumai-penn'],
      documents: [],
      interests: ['Healthcare', 'Education', 'Employment', 'Housing'],
      role: 'citizen'
    };
  }

  const u = data.user || data.profile || data;
  const p = (u.profile && typeof u.profile === 'object') ? u.profile : {};
  
  const rawId = u._id || u.id || p._id || p.id || `user-${Date.now()}`;
  const idStr = typeof rawId === 'object' && rawId?.toString ? rawId.toString() : String(rawId);

  const fullName = String(u.fullName || u.name || p.fullName || fallbackName || 'Citizen User').trim();
  const email = String(u.email || p.email || fallbackEmail || '').trim().toLowerCase();
  const mobile = String(u.mobile || p.mobile || '+91 98402 12345').trim();

  const rawRole = String(u.role || p.role || '').toLowerCase();
  const role: 'citizen' | 'admin' | 'superadmin' = 
    rawRole.includes('super') ? 'superadmin' :
    rawRole.includes('admin') || email === 'admin@govscheme.in' ? 'admin' : 'citizen';

  const rawAge = u.age !== undefined && u.age !== null && u.age !== '' ? u.age : (p.age !== undefined && p.age !== null && p.age !== '' ? p.age : null);
  const age = rawAge !== null && !isNaN(Number(rawAge)) && Number(rawAge) > 0 ? Number(rawAge) : 28;

  const gender = ((u.gender || p.gender || 'Male') as TargetGender);
  const maritalStatus = String(u.maritalStatus || p.maritalStatus || 'Single').trim();
  const state = String(u.state || p.state || 'Tamil Nadu').trim();
  const district = String(u.district || p.district || 'Chennai').trim();
  const category = ((u.category || p.category || 'OBC') as CategorySocial);
  const occupation = String(u.occupation || p.occupation || 'Salaried Employee').trim();
  const educationLevel = String(u.educationLevel || p.educationLevel || 'Graduate').trim();

  const rawIncome = u.annualIncome !== undefined && u.annualIncome !== null && u.annualIncome !== '' ? u.annualIncome : (p.annualIncome !== undefined && p.annualIncome !== null && p.annualIncome !== '' ? p.annualIncome : undefined);
  const annualIncome = rawIncome !== undefined && rawIncome !== null && !isNaN(Number(rawIncome)) ? Number(rawIncome) : 180000;

  const rawLand = u.landHoldingAcres !== undefined && u.landHoldingAcres !== null && u.landHoldingAcres !== '' ? u.landHoldingAcres : (p.landHoldingAcres !== undefined && p.landHoldingAcres !== null && p.landHoldingAcres !== '' ? p.landHoldingAcres : 0);
  const landHoldingAcres = !isNaN(Number(rawLand)) ? Number(rawLand) : 0;

  const rawFamily = u.familyMembersCount !== undefined && u.familyMembersCount !== null ? u.familyMembersCount : (p.familyMembersCount ?? 4);
  const familyMembersCount = !isNaN(Number(rawFamily)) && Number(rawFamily) >= 1 ? Number(rawFamily) : 4;

  const hasDisability = Boolean(u.hasDisability ?? p.hasDisability ?? false);
  const rawDisPct = u.disabilityPercentage !== undefined && u.disabilityPercentage !== null ? u.disabilityPercentage : (p.disabilityPercentage ?? 0);
  const disabilityPercentage = !isNaN(Number(rawDisPct)) ? Number(rawDisPct) : 0;

  const isRegisteredWorker = Boolean(u.isRegisteredWorker ?? p.isRegisteredWorker ?? false);
  const verificationBadge = Boolean(u.verificationBadge ?? p.verificationBadge ?? true);

  const interests = Array.isArray(u.interests) && u.interests.length > 0 ? u.interests : (Array.isArray(p.interests) && p.interests.length > 0 ? p.interests : ['Healthcare', 'Education', 'Employment', 'Housing']);
  const savedSchemeIds = Array.isArray(u.savedSchemeIds) && u.savedSchemeIds.length > 0 ? u.savedSchemeIds : (Array.isArray(p.savedSchemeIds) && p.savedSchemeIds.length > 0 ? p.savedSchemeIds : ['pm-kisan', 'pmay-g', 'tn-pudhumai-penn']);
  const documents = Array.isArray(u.documents) ? u.documents : (Array.isArray(p.documents) ? p.documents : []);
  const avatarUrl = u.avatarUrl || p.avatarUrl || (fullName ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=0369a1` : '');
  const token = data.token || u.token || '';

  const normalized: UserProfile = {
    id: idStr,
    fullName,
    email,
    mobile,
    age,
    gender,
    maritalStatus,
    state,
    district,
    category,
    occupation,
    annualIncome,
    landHoldingAcres,
    educationLevel,
    familyMembersCount,
    hasDisability,
    disabilityPercentage,
    isRegisteredWorker,
    verificationBadge,
    interests,
    savedSchemeIds,
    documents,
    avatarUrl,
    role,
    token,
    profileCompletionScore: 0
  };

  normalized.profileCompletionScore = calculateProfileCompletion(normalized);
  return normalized;
};
