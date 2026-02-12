-- ============================================
-- Water Tracking
-- ============================================

-- Insert system-level Water food item (available to all users)
INSERT INTO foods (name, serving_size, calories, protein, carbs, fat, source, user_id, barcode)
VALUES ('Water', '8 oz', 0, 0, 0, 0, 'manual', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Update user_settings goals default to include water
ALTER TABLE user_settings
  ALTER COLUMN goals SET DEFAULT '{"calories": 2000, "protein": 150, "carbs": 200, "fat": 65, "water": 8}'::jsonb;

-- Drop old constraint and add new one that includes water
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS valid_goals;
ALTER TABLE user_settings ADD CONSTRAINT valid_goals CHECK (
  goals ? 'calories' AND goals ? 'protein' AND goals ? 'carbs' AND goals ? 'fat'
);

-- Add water goal to existing users who don't have it
UPDATE user_settings
SET goals = goals || '{"water": 8}'::jsonb
WHERE NOT (goals ? 'water');
