-- Add extended nutrition label columns to foods table
ALTER TABLE foods
  ADD COLUMN IF NOT EXISTS saturated_fat REAL,
  ADD COLUMN IF NOT EXISTS trans_fat REAL,
  ADD COLUMN IF NOT EXISTS cholesterol REAL,
  ADD COLUMN IF NOT EXISTS potassium REAL,
  ADD COLUMN IF NOT EXISTS vitamin_d REAL,
  ADD COLUMN IF NOT EXISTS calcium REAL,
  ADD COLUMN IF NOT EXISTS iron REAL;
