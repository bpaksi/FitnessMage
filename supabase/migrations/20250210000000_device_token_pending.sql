-- ============================================
-- Device tokens: pending invitation support
-- ============================================

-- New tokens should start with last_active_at = NULL (pending).
-- Accepted devices get a timestamp on first verify.
ALTER TABLE device_tokens ALTER COLUMN last_active_at DROP DEFAULT;

-- Clean up rows that were never truly active (last_active_at was auto-set at creation)
UPDATE device_tokens
SET last_active_at = NULL
WHERE last_active_at = created_at;
