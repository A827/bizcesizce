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

export const CATEGORIES = [
  'Politics', 'Local', 'Economy', 'Lifestyle',
  'Transport', 'Environment', 'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Choice = 'agree' | 'disagree';

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
