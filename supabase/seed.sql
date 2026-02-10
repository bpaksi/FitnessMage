-- Seed data for local development
-- This runs after migrations when you start Supabase locally

-- ============================================
-- Test user: bpaksi@gmail.com / Password123!
-- ============================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token,
  email_change, email_change_token_new, recovery_token,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'authenticated', 'authenticated',
  'bpaksi@gmail.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  NOW(), NOW(), '',
  '', '', '',
  '{"provider":"email","providers":["email"]}',
  '{}'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  jsonb_build_object('sub', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'email', 'bpaksi@gmail.com'),
  'email',
  NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- ============================================
-- Sample foods
-- ============================================
INSERT INTO foods (barcode, name, brand, serving_size, calories, protein, carbs, fat, source)
VALUES
  (NULL, 'Banana (medium)', NULL, '118g', 105, 1, 27, 0, 'manual'),
  (NULL, 'Eggs (2 large)', NULL, '100g', 140, 12, 1, 10, 'manual'),
  (NULL, 'Chicken Breast (grilled)', NULL, '150g', 231, 43, 0, 5, 'manual'),
  (NULL, 'White Rice (cooked)', NULL, '158g', 206, 4, 45, 0, 'manual'),
  (NULL, 'Oatmeal (cooked)', NULL, '234g', 158, 6, 27, 3, 'manual'),
  (NULL, 'Almonds', NULL, '28g', 164, 6, 6, 14, 'manual'),
  (NULL, 'Greek Yogurt (plain)', 'Fage', '200g', 130, 18, 8, 0, 'manual'),
  (NULL, 'Whey Protein Shake', 'Optimum Nutrition', '1 scoop', 120, 24, 3, 1, 'manual')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample daily log entries for today
-- ============================================
INSERT INTO daily_log (user_id, date, food_id, meal_type, servings, calories, protein, carbs, fat)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  CURRENT_DATE,
  f.id, 'breakfast', 1,
  f.calories, f.protein, f.carbs, f.fat
FROM foods f WHERE f.name = 'Oatmeal (cooked)'
UNION ALL
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  CURRENT_DATE,
  f.id, 'breakfast', 1,
  f.calories, f.protein, f.carbs, f.fat
FROM foods f WHERE f.name = 'Banana (medium)'
UNION ALL
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  CURRENT_DATE,
  f.id, 'lunch', 1,
  f.calories, f.protein, f.carbs, f.fat
FROM foods f WHERE f.name = 'Chicken Breast (grilled)'
UNION ALL
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  CURRENT_DATE,
  f.id, 'lunch', 1,
  f.calories, f.protein, f.carbs, f.fat
FROM foods f WHERE f.name = 'White Rice (cooked)';
