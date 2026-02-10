-- Food Serving Units table

CREATE TABLE IF NOT EXISTS food_serving_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  grams NUMERIC NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_serving_units_food_id ON food_serving_units(food_id);

-- Row Level Security
ALTER TABLE food_serving_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food serving units are viewable by everyone" ON food_serving_units
  FOR SELECT USING (true);

CREATE POLICY "Food serving units are insertable" ON food_serving_units
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Food serving units are updatable" ON food_serving_units
  FOR UPDATE USING (true);
