// Bilingual strings. Turkish is the default; English is the toggle.
// NOTE TO OWNER: a native Turkish speaker should review every TR string
// below before launch. I have written careful Turkish, but a human pass
// is part of the quality bar.

export type Lang = 'tr' | 'en';

export const STRINGS = {
  tagline:        { tr: 'Bizce sizce — sen ne diyorsun?',           en: 'Our view, your view — what do you say?' },
  continueGoogle: { tr: 'Google ile devam et',                       en: 'Continue with Google' },

  // First-run setup
  setupTitle:     { tr: 'Birkaç saniyelik kurulum',                  en: 'A few seconds of setup' },
  setupBlurb:     { tr: 'Sonuçları bölgeye göre gösterebilmemiz için bölgeni ve yaş aralığını seç. Kimliğin asla paylaşılmaz.',
                    en: 'Choose your region and age range so we can show results by region. Your identity is never shared.' },
  chooseRegion:   { tr: 'Bölgen',                                    en: 'Your region' },
  chooseAge:      { tr: 'Yaş aralığın',                              en: 'Your age range' },
  start:          { tr: 'Başla',                                     en: 'Start' },

  // Home
  dailyKicker:    { tr: 'Günün sorusu',                              en: 'Question of the day' },
  feedKicker:     { tr: 'Diğer konular',                             en: 'Other topics' },
  suggestCta:     { tr: 'Bir konu öner',                             en: 'Suggest a topic' },

  // Vote / reveal
  agree:          { tr: 'Katılıyorum',                               en: 'Agree' },
  disagree:       { tr: 'Katılmıyorum',                              en: 'Disagree' },
  totalVotes:     { tr: 'toplam oy',                                 en: 'total votes' },
  withMajority:   { tr: 'Çoğunlukla aynı taraftasın',               en: "You're with the majority" },
  outlier:        { tr: 'Sen bir istisnasın',                        en: "You're an outlier" },
  byRegion:       { tr: 'Bölgelere göre',                            en: 'By region' },
  alreadyVoted:   { tr: 'Bu konuda zaten oy kullandın',             en: 'You already voted on this' },

  // Suggest
  suggestTitle:   { tr: 'Bir konu öner',                            en: 'Suggest a topic' },
  suggestBlurb:   { tr: 'Fikrin gözden geçirildikten sonra yayınlanabilir.',
                    en: 'Your idea may be published after review.' },
  qTr:            { tr: 'Soru (Türkçe)',                             en: 'Question (Turkish)' },
  qEn:            { tr: 'Soru (İngilizce) — isteğe bağlı',          en: 'Question (English) — optional' },
  send:           { tr: 'Gönder',                                    en: 'Send' },
  thanks:         { tr: 'Teşekkürler! Önerin alındı.',              en: 'Thank you! Your suggestion was received.' },

  // Admin
  adminTitle:     { tr: 'Yönetim',                                   en: 'Admin' },
  pending:        { tr: 'Bekleyen öneriler',                         en: 'Pending suggestions' },
  approve:        { tr: 'Onayla',                                    en: 'Approve' },
  reject:         { tr: 'Reddet',                                    en: 'Reject' },
  setDaily:       { tr: 'Günün sorusu yap',                          en: 'Make question of the day' },
  deactivate:     { tr: 'Gizle',                                     en: 'Hide' },
  createTopic:    { tr: 'Yeni konu oluştur',                         en: 'Create new topic' },

  // States
  loading:        { tr: 'Yükleniyor…',                              en: 'Loading…' },
  emptyFeed:      { tr: 'Şu an aktif konu yok. Birazdan tekrar bak.', en: 'No active topics right now. Check back soon.' },
  errorGeneric:   { tr: 'Bir şeyler ters gitti. Tekrar dene.',      en: 'Something went wrong. Please try again.' },
  retry:          { tr: 'Tekrar dene',                              en: 'Retry' },

  // Footer / legal
  privacy:        { tr: 'Gizlilik',                                  en: 'Privacy' },
  terms:          { tr: 'Koşullar',                                  en: 'Terms' },
  share:          { tr: 'Paylaş',                                    en: 'Share' },
  signOut:        { tr: 'Çıkış yap',                                 en: 'Sign out' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}
