-- Foods table (cached from Open Food Facts + manual entries)

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
  category TEXT NOT NULL DEFAULT 'food' CHECK (category IN ('food', 'supplement')),

  -- Extended nutrition (added via extended_nutrition_columns migration)
  saturated_fat NUMERIC,
  trans_fat NUMERIC,
  cholesterol NUMERIC,
  potassium NUMERIC,
  vitamin_d NUMERIC,
  calcium NUMERIC,
  iron NUMERIC,

  -- Expanded nutrients
  vitamin_a REAL,
  vitamin_c REAL,
  vitamin_e REAL,
  vitamin_k REAL,
  thiamin REAL,
  riboflavin REAL,
  niacin REAL,
  vitamin_b6 REAL,
  folate REAL,
  vitamin_b12 REAL,
  choline REAL,
  retinol REAL,
  magnesium REAL,
  phosphorus REAL,
  zinc REAL,
  copper REAL,
  selenium REAL,
  manganese REAL,
  monounsaturated_fat REAL,
  polyunsaturated_fat REAL,
  caffeine REAL,
  alcohol REAL,
  water_content REAL,

  source TEXT NOT NULL DEFAULT 'manual', -- 'openfoodfacts', 'usda', 'manual'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = shared, set = personal

  -- Contribution tracking
  pending_contribution BOOLEAN DEFAULT false,
  contribution_status TEXT, -- 'contributed', 'skipped_no_credentials', 'skipped_no_barcode', 'dismissed', 'error'
  contribution_error TEXT,
  contributed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
CREATE INDEX IF NOT EXISTS idx_foods_pending_contribution ON foods(pending_contribution) WHERE pending_contribution = true;
CREATE INDEX IF NOT EXISTS idx_foods_user_id ON foods(user_id);

-- Row Level Security
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Foods are viewable by everyone or owner" ON foods
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Foods are insertable by service role" ON foods
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Foods are updatable by service role" ON foods
  FOR UPDATE USING (true);

-- Triggers
CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
