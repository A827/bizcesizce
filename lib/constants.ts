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

export const CATEGORIES = [
  'Politics', 'Local', 'Economy', 'Lifestyle',
  'Transport', 'Environment', 'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Choice = 'agree' | 'disagree';
