ALTER TABLE device_tokens ADD COLUMN device_type TEXT DEFAULT 'unknown';
ALTER TABLE device_tokens ADD COLUMN device_info JSONB DEFAULT '{}'::jsonb;
