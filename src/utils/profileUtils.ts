import { UserProfile } from '../types';

export const calculateProfileCompletion = (user: Partial<UserProfile>): number => {
  const fieldsToTrack = [
    { key: 'fullName', weight: 10 },
    { key: 'mobile', weight: 10 },
    { key: 'age', weight: 10 },
    { key: 'gender', weight: 10 },
    { key: 'state', weight: 10 },
    { key: 'district', weight: 10 },
    { key: 'occupation', weight: 15 },
    { key: 'annualIncome', weight: 15 },
    { key: 'educationLevel', weight: 10 }
  ];

  let score = 0;
  
  fieldsToTrack.forEach(field => {
    const value = user[field.key as keyof UserProfile];
    if (value !== undefined && value !== null && value !== '' && value !== 0) {
      score += field.weight;
    }
  });

  return Math.min(100, score);
};
