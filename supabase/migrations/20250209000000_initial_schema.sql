-- ============================================
-- Fitness Mage — Initial Schema
-- ============================================

-- Shared database functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Foods table (cached from Open Food Facts + manual entries)
-- ============================================
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size TEXT,
  serving_size_grams NUMERIC,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC,
  sugar NUMERIC,
  sodium NUMERIC,
  source TEXT NOT NULL DEFAULT 'manual',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pending_contribution BOOLEAN DEFAULT false,
  contribution_status TEXT,
  contribution_error TEXT,
  contributed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
CREATE INDEX IF NOT EXISTS idx_foods_pending_contribution ON foods(pending_contribution) WHERE pending_contribution = true;
CREATE INDEX IF NOT EXISTS idx_foods_user_id ON foods(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods USING gin(to_tsvector('english', name));

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Foods are viewable by everyone or owner" ON foods
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Foods are insertable by service role" ON foods
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Foods are updatable by owner or service role" ON foods
  FOR UPDATE USING (user_id IS NULL OR user_id = auth.uid());

CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Food Serving Units table
-- ============================================
CREATE TABLE IF NOT EXISTS food_serving_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  grams NUMERIC NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_serving_units_food_id ON food_serving_units(food_id);

ALTER TABLE food_serving_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food serving units are viewable by everyone" ON food_serving_units
  FOR SELECT USING (true);

CREATE POLICY "Food serving units are insertable" ON food_serving_units
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Food serving units are updatable" ON food_serving_units
  FOR UPDATE USING (true);

-- ============================================
-- Meals table (user-defined meal presets)
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Meal Foods junction table
-- ============================================
CREATE TABLE IF NOT EXISTS meal_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  servings NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);

ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meal foods for own meals" ON meal_foods
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid())
  );

CREATE POLICY "Users can manage meal foods for own meals" ON meal_foods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid())
  );

-- ============================================
-- User Settings table (with new fields)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goals JSONB NOT NULL DEFAULT '{"calories": 2000, "protein": 150, "carbs": 200, "fat": 65}'::jsonb,
  week_start_day TEXT NOT NULL DEFAULT 'monday'
    CHECK (week_start_day IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  units TEXT NOT NULL DEFAULT 'metric'
    CHECK (units IN ('metric','imperial')),
  meal_time_boundaries JSONB NOT NULL DEFAULT '{
    "breakfast": {"start": "06:00", "end": "10:00"},
    "lunch": {"start": "11:00", "end": "14:00"},
    "dinner": {"start": "17:00", "end": "21:00"}
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_goals CHECK (
    goals ? 'calories' AND goals ? 'protein' AND goals ? 'carbs' AND goals ? 'fat'
  )
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Daily Log table
-- ============================================
CREATE TABLE IF NOT EXISTS daily_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
  meal_type TEXT NOT NULL DEFAULT 'snack',
  servings NUMERIC NOT NULL DEFAULT 1,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  logged_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_meal_type CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  CONSTRAINT food_or_meal_exclusive CHECK (
    (food_id IS NOT NULL AND meal_id IS NULL) OR
    (food_id IS NULL AND meal_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_daily_log_user_date ON daily_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log(date);

ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily log" ON daily_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily log entries" ON daily_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily log entries" ON daily_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily log entries" ON daily_log
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Device Tokens table (mobile auth)
-- ============================================
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own device tokens" ON device_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages device tokens" ON device_tokens
  FOR ALL USING (true);

-- ============================================
-- Food Favorites table
-- ============================================
CREATE TABLE food_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_id)
);

CREATE INDEX idx_food_favorites_user ON food_favorites(user_id);

ALTER TABLE food_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON food_favorites
  FOR ALL USING (auth.uid() = user_id);
