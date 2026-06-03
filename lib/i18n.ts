// Bilingual strings. Turkish is the default; English is the toggle.
// NOTE TO OWNER: a native Turkish speaker should review every TR string
// below before launch. I have written careful Turkish, but a human pass
// is part of the quality bar.

export type Lang = 'tr' | 'en';

export const STRINGS = {
  tagline:        { tr: 'Bizce sizce — sen ne diyorsun?',           en: 'Our view, your view — what do you say?' },
  continueGoogle: { tr: 'Google ile devam et',                       en: 'Continue with Google' },
  orDivider:      { tr: 'veya',                                       en: 'or' },
  emailPlaceholder:{ tr: 'E-posta adresin',                          en: 'Your email' },
  emailSend:      { tr: 'E-posta ile giriş bağlantısı gönder',       en: 'Send me a sign-in link' },
  emailSent:      { tr: 'Giriş bağlantısı e-postana gönderildi. Gelen kutunu kontrol et.', en: 'A sign-in link is on its way. Check your inbox.' },
  loginBlurb:     { tr: 'Kuzey Kıbrıs ne düşünüyor? Oyla, anında sonuçları gör.', en: 'What does North Cyprus think? Vote and see live results.' },

  // First-run setup
  setupTitle:     { tr: 'Birkaç saniyelik kurulum',                  en: 'A few seconds of setup' },
  setupBlurb:     { tr: 'Sonuçları bölgeye göre gösterebilmemiz için bölgeni ve yaş aralığını seç. Kimliğin asla paylaşılmaz.',
                    en: 'Choose your region and age range so we can show results by region. Your identity is never shared.' },
  chooseRegion:   { tr: 'Bölgen',                                    en: 'Your region' },
  chooseAge:      { tr: 'Yaş aralığın',                              en: 'Your age range' },
  chooseGender:   { tr: 'Cinsiyet',                                  en: 'Gender' },
  chooseEducation:{ tr: 'Eğitim durumu',                            en: 'Education' },
  chooseEmployment:{ tr: 'Çalışma durumu',                          en: 'Employment' },
  chooseOrigin:   { tr: 'Nereden olduğun',                          en: 'Where you are from' },
  start:          { tr: 'Başla',                                     en: 'Start' },

  // Comments
  comments:       { tr: 'Yorumlar',                                  en: 'Comments' },
  commentsOff:    { tr: 'Bu konuda yorumlar kapalı.',               en: 'Comments are off for this topic.' },
  addComment:     { tr: 'Yorum yaz…',                               en: 'Write a comment…' },
  postComment:    { tr: 'Gönder',                                    en: 'Post' },
  commentPending: { tr: 'Yorumun incelendikten sonra yayınlanacak.', en: 'Your comment will appear after review.' },
  noComments:     { tr: 'Henüz yorum yok. İlk yorumu sen yaz.',     en: 'No comments yet. Be the first.' },
  voteToComment:  { tr: 'Yorum yapmak için önce oy ver.',          en: 'Vote first to comment.' },
  rateLimited:    { tr: 'Çok hızlısın, biraz bekleyip tekrar dene.', en: "You're going too fast — please wait a moment." },

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
  tabSuggestions: { tr: 'Öneriler',                                  en: 'Suggestions' },
  tabTopics:      { tr: 'Konular',                                    en: 'Topics' },
  tabResults:     { tr: 'Sonuçlar',                                   en: 'Results' },
  tabModeration:  { tr: 'Yorum denetimi',                            en: 'Comment moderation' },
  commentsOn:     { tr: 'Yorumlar açık',                             en: 'Comments on' },
  commentsAuto:   { tr: 'Otomatik onay',                             en: 'Auto-approve' },
  exportCsv:      { tr: 'CSV indir',                                  en: 'Export CSV' },
  overTime:       { tr: 'Zamana göre',                               en: 'Over time' },
  noPending:      { tr: 'Bekleyen yorum yok.',                       en: 'No pending comments.' },

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
