// Shared, single-source-of-truth lists. The database enforces these too,
// but the app reads them from here so the buttons/chips always match.

export const REGIONS = [
  'Lefkoşa', 'Girne', 'Mağusa', 'Güzelyurt', 'İskele', 'Lefke',
] as const;
export type Region = (typeof REGIONS)[number];

export const AGE_BANDS = [
  '18-24', '25-34', '35-44', '45-54', '55+',
] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const GENDERS = [
  'Kadın', 'Erkek', 'Diğer', 'Belirtmek istemiyorum',
] as const;
export type Gender = (typeof GENDERS)[number];

export const EDUCATIONS = [
  'İlkokul', 'Lise', 'Üniversite', 'Yüksek lisans ve üzeri',
] as const;
export type Education = (typeof EDUCATIONS)[number];

export const EMPLOYMENTS = [
  'Öğrenci', 'Kamu', 'Özel sektör', 'Serbest', 'Emekli', 'Çalışmıyor',
] as const;
export type Employment = (typeof EMPLOYMENTS)[number];

export const ORIGINS = [
  'Kuzey Kıbrıs', 'Güney Kıbrıs', 'Türkiye', 'Diğer',
] as const;
export type Origin = (typeof ORIGINS)[number];

export const MARITAL_STATUSES = [
  'Bekar', 'İlişkisi var', 'Evli', 'Boşanmış', 'Dul', 'Belirtmek istemiyorum',
] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

// Derive the fixed age band (used for vote breakdowns) from a birth date.
export function ageFromDob(dob: string): number | null {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function ageBandFromDob(dob: string): AgeBand | null {
  const age = ageFromDob(dob);
  if (age === null || age < 18 || age > 120) return null;
  if (age <= 24) return '18-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  if (age <= 54) return '45-54';
  return '55+';
}

export const CATEGORIES = [
  'Politics', 'Local', 'Economy', 'Lifestyle',
  'Transport', 'Environment', 'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Choice = 'agree' | 'disagree';
export type PollType = 'binary' | 'multi';

// Privacy / believability thresholds for PUBLIC result displays.
// The regional breakdown only shows once a topic has enough total votes,
// and an individual region row only shows once that region has enough —
// so small samples can't mislead and no one's vote can be inferred.
export const MIN_BREAKDOWN_TOTAL = 10;
export const MIN_BUCKET = 5;
// The daily "you're with the majority / outlier" verdict waits for this many.
export const MIN_VERDICT_TOTAL = 10;
export type CommentMode = 'manual' | 'auto';
export type CommentStatus = 'pending' | 'approved' | 'rejected';
