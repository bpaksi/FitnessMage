-- User Settings table

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goals JSONB NOT NULL DEFAULT '{"calories": 2000, "protein": 150, "carbs": 200, "fat": 65}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_goals CHECK (
    goals ? 'calories' AND goals ? 'protein' AND goals ? 'carbs' AND goals ? 'fat'
  )
);

-- Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
