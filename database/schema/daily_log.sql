-- Daily Log table

CREATE TABLE IF NOT EXISTS daily_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
  meal_type TEXT NOT NULL DEFAULT 'snack',
  servings NUMERIC NOT NULL DEFAULT 1,

  -- Calculated macros at time of logging (for history accuracy)
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,

  logged_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_meal_type CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  CONSTRAINT food_or_meal_exclusive CHECK (
    (food_id IS NOT NULL AND meal_id IS NULL) OR
    (food_id IS NULL AND meal_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_log_user_date ON daily_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log(date);

-- Row Level Security
ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily log" ON daily_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily log entries" ON daily_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily log entries" ON daily_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily log entries" ON daily_log
  FOR DELETE USING (auth.uid() = user_id);
