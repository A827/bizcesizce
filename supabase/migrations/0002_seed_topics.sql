-- =====================================================================
-- Seed: 15 realistic North Cyprus topics so the app never looks empty.
-- The first one is the daily question. Owner can change all of this
-- later from the Admin screen.
-- NOTE: Turkish strings should get a native-speaker review before launch.
-- =====================================================================

insert into public.topics (question_tr, question_en, category, is_daily, is_active) values
('Lefkoşa''da trafik son bir yılda daha da kötüleşti.',
 'Traffic in Lefkoşa has gotten worse over the past year.',
 'Transport', true, true),

('Toplu taşıma ücretsiz olmalı.',
 'Public transport should be free.',
 'Transport', false, true),

('Kıyılar herkese açık olmalı, özel plaj ücreti alınmamalı.',
 'Beaches should be open to all, with no private-beach fees.',
 'Environment', false, true),

('Su kıtlığı, ülkenin en acil sorunudur.',
 'Water scarcity is the country''s most urgent problem.',
 'Environment', false, true),

('Kira fiyatları artık karşılanabilir değil.',
 'Rent prices are no longer affordable.',
 'Economy', false, true),

('Asgari ücret geçinmeye yetmiyor.',
 'The minimum wage is not enough to live on.',
 'Economy', false, true),

('Yerel ürünleri ithal ürünlere tercih ederim.',
 'I prefer local products over imported ones.',
 'Lifestyle', false, true),

('Şehir merkezlerinde daha fazla yeşil alan olmalı.',
 'There should be more green space in town centres.',
 'Local', false, true),

('Hafta sonları çarşılar daha geç saatlere kadar açık olmalı.',
 'Shops should stay open later on weekends.',
 'Lifestyle', false, true),

('Elektrik kesintileri günlük hayatı ciddi şekilde etkiliyor.',
 'Power cuts seriously disrupt daily life.',
 'Local', false, true),

('Geri dönüşüm imkanları yetersiz.',
 'Recycling facilities are inadequate.',
 'Environment', false, true),

('Üniversiteler bölge ekonomisine olumlu katkı sağlıyor.',
 'Universities contribute positively to the local economy.',
 'Economy', false, true),

('İnternet hızı ödediğimiz ücreti hak etmiyor.',
 'Internet speed is not worth what we pay for it.',
 'Local', false, true),

('Tarihi yapıların korunmasına yeterince önem verilmiyor.',
 'Not enough is done to protect historic buildings.',
 'Local', false, true),

('Bisiklet yolları şehirlerde bir öncelik olmalı.',
 'Cycle lanes should be a priority in cities.',
 'Transport', false, true);
