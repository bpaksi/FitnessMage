-- Meal Foods junction table

CREATE TABLE IF NOT EXISTS meal_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  servings NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);

-- Row Level Security
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meal foods for own meals" ON meal_foods
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid())
  );

CREATE POLICY "Users can manage meal foods for own meals" ON meal_foods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid())
  );
