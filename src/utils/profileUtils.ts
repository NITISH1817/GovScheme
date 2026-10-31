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
      fullName: fallbackName,
      mobile: '',
      email: fallbackEmail,
      age: undefined as any,
      gender: '' as TargetGender,
      maritalStatus: '',
      state: '',
      district: '',
      category: '' as CategorySocial,
      occupation: '',
      annualIncome: undefined as any,
      landHoldingAcres: 0,
      educationLevel: '',
      familyMembersCount: 1,
      hasDisability: false,
      disabilityPercentage: 0,
      isRegisteredWorker: false,
      verificationBadge: false,
      profileCompletionScore: 0,
      savedSchemeIds: [],
      documents: [],
      interests: [],
      role: 'citizen'
    };
  }

  const u = data.user || data.profile || data;
  const p = (u.profile && typeof u.profile === 'object') ? u.profile : {};
  
  const rawId = u._id || u.id || p._id || p.id || `user-${Date.now()}`;
  const idStr = typeof rawId === 'object' && rawId?.toString ? rawId.toString() : String(rawId);

  const fullName = String(u.fullName || u.name || p.fullName || fallbackName || '').trim();
  const email = String(u.email || p.email || fallbackEmail || '').trim().toLowerCase();
  const mobile = String(u.mobile || p.mobile || '').trim();

  const rawRole = String(u.role || p.role || '').trim();
  const lowerRole = rawRole.toLowerCase();
  const role: string =
    (lowerRole === 'superadmin' || lowerRole === 'super admin') ? 'Super Admin' :
    (lowerRole === 'state admin') ? 'State Admin' :
    (lowerRole === 'ministry admin') ? 'Ministry Admin' :
    (lowerRole === 'district officer') ? 'District Officer' :
    (lowerRole === 'nodal officer') ? 'Nodal Officer' :
    (lowerRole === 'data entry operator') ? 'Data Entry Operator' :
    (lowerRole === 'admin') ? 'Admin' : 'Citizen';

  const rawAge = u.age !== undefined && u.age !== null && u.age !== '' ? u.age : (p.age !== undefined && p.age !== null && p.age !== '' ? p.age : null);
  const age = rawAge !== null && !isNaN(Number(rawAge)) && Number(rawAge) > 0 ? Number(rawAge) : (undefined as any);

  const gender = (u.gender || p.gender || '') as TargetGender;
  const maritalStatus = String(u.maritalStatus || p.maritalStatus || '').trim();
  const state = String(u.state || p.state || '').trim();
  const district = String(u.district || p.district || '').trim();
  const category = (u.category || p.category || '') as CategorySocial;
  const occupation = String(u.occupation || p.occupation || '').trim();
  const educationLevel = String(u.educationLevel || p.educationLevel || '').trim();

  const rawIncome = u.annualIncome !== undefined && u.annualIncome !== null && u.annualIncome !== '' ? u.annualIncome : (p.annualIncome !== undefined && p.annualIncome !== null && p.annualIncome !== '' ? p.annualIncome : undefined);
  const annualIncome = rawIncome !== undefined && rawIncome !== null && !isNaN(Number(rawIncome)) ? Number(rawIncome) : (undefined as any);

  const rawLand = u.landHoldingAcres !== undefined && u.landHoldingAcres !== null && u.landHoldingAcres !== '' ? u.landHoldingAcres : (p.landHoldingAcres !== undefined && p.landHoldingAcres !== null && p.landHoldingAcres !== '' ? p.landHoldingAcres : 0);
  const landHoldingAcres = !isNaN(Number(rawLand)) ? Number(rawLand) : 0;

  const rawFamily = u.familyMembersCount !== undefined && u.familyMembersCount !== null ? u.familyMembersCount : (p.familyMembersCount ?? 1);
  const familyMembersCount = !isNaN(Number(rawFamily)) && Number(rawFamily) >= 1 ? Number(rawFamily) : 1;

  const hasDisability = Boolean(u.hasDisability ?? p.hasDisability ?? false);
  const rawDisPct = u.disabilityPercentage !== undefined && u.disabilityPercentage !== null ? u.disabilityPercentage : (p.disabilityPercentage ?? 0);
  const disabilityPercentage = !isNaN(Number(rawDisPct)) ? Number(rawDisPct) : 0;

  const isRegisteredWorker = Boolean(u.isRegisteredWorker ?? p.isRegisteredWorker ?? false);
  const verificationBadge = Boolean(u.verificationBadge ?? p.verificationBadge ?? false);

  const interests = Array.isArray(u.interests) ? u.interests : (Array.isArray(p.interests) ? p.interests : []);
  const savedSchemeIds = Array.isArray(u.savedSchemeIds) ? u.savedSchemeIds : (Array.isArray(p.savedSchemeIds) ? p.savedSchemeIds : []);
  const documents = Array.isArray(u.documents) ? u.documents : (Array.isArray(p.documents) ? p.documents : []);
  let avatarUrl = u.avatarUrl || p.avatarUrl || '';
  if (!avatarUrl || avatarUrl.includes('dicebear.com/7.x/initials')) {
    avatarUrl = getUserAvatarUrl({ fullName, email, avatarUrl });
  }
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

export const getUserAvatarUrl = (user?: { fullName?: string; avatarUrl?: string; email?: string } | null): string => {
  // If user uploaded a custom data/blob photo, preserve it
  if (user?.avatarUrl && (user.avatarUrl.startsWith('data:image') || user.avatarUrl.startsWith('blob:') || user.avatarUrl.startsWith('/uploads/'))) {
    return user.avatarUrl;
  }
  const rawName = (user?.fullName || '').trim() || (user?.email ? user.email.split('@')[0] : 'Citizen');
  const words = rawName.split(/\s+/).filter(Boolean);
  let initials = 'CI';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="#0284c7"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
