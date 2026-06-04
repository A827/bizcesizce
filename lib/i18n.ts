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
  tabSignIn:      { tr: 'Giriş yap',                                  en: 'Log in' },
  tabSignUp:      { tr: 'Hesap oluştur',                              en: 'Sign up' },
  passwordPlaceholder: { tr: 'Şifre',                                 en: 'Password' },
  pwLogin:        { tr: 'Giriş yap',                                  en: 'Log in' },
  pwSignup:       { tr: 'Hesap oluştur',                              en: 'Create account' },
  confirmEmailSent:{ tr: 'Hesabını doğrulamak için e-postana gönderdiğimiz bağlantıya tıkla.',
                     en: 'Click the link we emailed you to confirm your account.' },
  wrongCreds:     { tr: 'E-posta veya şifre hatalı.',                 en: 'Wrong email or password.' },
  emailNotConfirmed:{ tr: 'Önce e-postandaki doğrulama bağlantısına tıkla.', en: 'Please confirm your email first (check your inbox).' },
  pwTooShort:     { tr: 'Şifre en az 6 karakter olmalı.',            en: 'Password must be at least 6 characters.' },
  magicInstead:   { tr: 'Şifresiz giriş bağlantısı gönder',          en: 'Email me a sign-in link instead' },

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

  // Fun signup wizard
  welcomeTitle:   { tr: 'Hoş geldin! 👋',                            en: 'Welcome! 👋' },
  welcomeBlurb:   { tr: 'Seni biraz tanıyalım. Sadece birkaç soru — istediğini geç. Verilerin gizli kalır, sonuçlar hep anonim gösterilir.',
                    en: "Let's get to know you a little. Just a few quick questions — skip any you like. Your data stays private; results are always shown anonymously." },
  letsGo:         { tr: 'Hadi başlayalım',                           en: "Let's go" },
  askFirstName:   { tr: 'Adın ne?',                                  en: "What's your first name?" },
  askFirstNameSub:{ tr: 'Yorumlarında bu görünecek.',               en: 'This shows on your comments.' },
  askLastName:    { tr: 'Peki soyadın?',                             en: 'And your last name?' },
  askLastNameSub: { tr: 'Gizli kalır, kimseyle paylaşılmaz.',        en: 'Kept private, never shared.' },
  askDob:         { tr: 'Doğum tarihin?',                            en: "When's your birthday?" },
  askDobSub:      { tr: 'Yaş gruplarına göre sonuç gösterebilmek için. Tarihin gizli kalır.',
                    en: 'So we can show results by age group. Your exact date stays private.' },
  askRegionQ:     { tr: 'Nerede yaşıyorsun?',                        en: 'Where do you live?' },
  askSexQ:        { tr: 'Cinsiyetin?',                               en: "What's your sex?" },
  askMaritalQ:    { tr: 'Medeni durumun?',                           en: "What's your relationship status?" },
  askJobQ:        { tr: 'Ne iş yapıyorsun?',                         en: 'What do you do?' },
  askEducationQ:  { tr: 'Eğitim durumun?',                           en: "What's your education?" },
  askOriginQ:     { tr: 'Aslen nerelisin?',                          en: 'Where are you originally from?' },
  askPhoneQ:      { tr: 'Telefon numaran?',                          en: "What's your phone number?" },
  askPhoneSub:    { tr: 'İsteğe bağlı. Gizli kalır — reklam yok, spam yok.',
                    en: 'Optional. Kept private — no ads, no spam.' },
  firstNamePh:    { tr: 'Adın',                                      en: 'First name' },
  lastNamePh:     { tr: 'Soyadın',                                   en: 'Last name' },
  phonePh:        { tr: 'örn. 0533 123 45 67',                       en: 'e.g. +90 533 123 45 67' },
  chooseMarital:  { tr: 'Medeni durum',                             en: 'Relationship status' },
  next:           { tr: 'Devam',                                     en: 'Next' },
  back:           { tr: 'Geri',                                      en: 'Back' },
  skip:           { tr: 'Geç',                                       en: 'Skip' },
  finishSetup:    { tr: 'Bitir',                                     en: 'Finish' },
  required:       { tr: 'Bu alan gerekli.',                          en: 'This one is required.' },
  tooYoung:       { tr: 'Katılmak için 18 yaşında olman gerekiyor.', en: 'You must be 18 or older to take part.' },
  almostThere:    { tr: 'Son bir adım — robot olmadığını doğrula.',  en: 'One last step — confirm you are human.' },
  doneTitle:      { tr: 'Hazırsın! 🎉',                              en: "You're all set! 🎉" },
  doneBlurb:      { tr: 'Profilin oluşturuldu. Şimdi oy verme zamanı.', en: 'Your profile is ready. Time to vote.' },
  goVote:         { tr: 'Oylamaya başla',                            en: 'Start voting' },

  // Profile page
  profileTitle:   { tr: 'Profilim',                                  en: 'My profile' },
  profileLink:    { tr: 'Profil',                                    en: 'Profile' },
  labDob:         { tr: 'Doğum tarihi',                              en: 'Date of birth' },
  labPhone:       { tr: 'Telefon',                                   en: 'Phone' },
  editable:       { tr: 'Düzenlenebilir',                            en: 'Editable' },
  lockedHint:     { tr: 'Sonuçların doğruluğu için sabit',           en: 'Fixed to keep results accurate' },
  memberSince:    { tr: 'Üyelik',                                    en: 'Member since' },
  save:           { tr: 'Kaydet',                                    en: 'Save' },
  saved:          { tr: 'Kaydedildi ✓',                              en: 'Saved ✓' },
  notSet:         { tr: 'Belirtilmemiş',                             en: 'Not set' },

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
  searchPolls:    { tr: 'Anketlerde ara…',                          en: 'Search polls…' },
  allCategories:  { tr: 'Hepsi',                                     en: 'All' },
  sortNew:        { tr: 'En yeni',                                   en: 'Newest' },
  sortTrending:   { tr: 'Popüler',                                   en: 'Trending' },
  noMatches:      { tr: 'Eşleşen anket yok.',                        en: 'No matching polls.' },

  // Vote / reveal
  agree:          { tr: 'Katılıyorum',                               en: 'Agree' },
  disagree:       { tr: 'Katılmıyorum',                              en: 'Disagree' },
  totalVotes:     { tr: 'toplam oy',                                 en: 'total votes' },
  withMajority:   { tr: 'Çoğunlukla aynı taraftasın',               en: "You're with the majority" },
  outlier:        { tr: 'Sen bir istisnasın',                        en: "You're an outlier" },
  byRegion:       { tr: 'Bölgelere göre',                            en: 'By region' },
  breakdownSoon:  { tr: 'Bölge dağılımı yeterli oy toplandığında görünecek.', en: 'Regional breakdown appears once enough votes are in.' },
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
  tabSponsors:    { tr: 'Sponsorlar',                                 en: 'Sponsors' },
  tabOverview:    { tr: 'Genel bakış',                                en: 'Overview' },
  tabPeople:      { tr: 'Kişiler',                                    en: 'People' },
  commentsOn:     { tr: 'Yorumlar açık',                             en: 'Comments on' },
  commentsAuto:   { tr: 'Otomatik onay',                             en: 'Auto-approve' },
  exportCsv:      { tr: 'CSV indir',                                  en: 'Export CSV' },
  overTime:       { tr: 'Zamana göre',                               en: 'Over time' },
  noPending:      { tr: 'Bekleyen yorum yok.',                       en: 'No pending comments.' },
  scheduleDaily:  { tr: 'Günün sorusu tarihi',                       en: 'Schedule as daily on' },

  // States
  loading:        { tr: 'Yükleniyor…',                              en: 'Loading…' },
  emptyFeed:      { tr: 'Şu an aktif konu yok. Birazdan tekrar bak.', en: 'No active topics right now. Check back soon.' },
  errorGeneric:   { tr: 'Bir şeyler ters gitti. Tekrar dene.',      en: 'Something went wrong. Please try again.' },
  retry:          { tr: 'Tekrar dene',                              en: 'Retry' },

  // Footer / legal
  privacy:        { tr: 'Gizlilik',                                  en: 'Privacy' },
  terms:          { tr: 'Koşullar',                                  en: 'Terms' },
  sponsored:      { tr: 'Sponsorlu',                                 en: 'Sponsored' },
  advertise:      { tr: 'Reklam ver',                                en: 'Advertise' },
  archive:        { tr: 'Arşiv',                                     en: 'Archive' },
  share:          { tr: 'Paylaş',                                    en: 'Share' },
  signOut:        { tr: 'Çıkış yap',                                 en: 'Sign out' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}
