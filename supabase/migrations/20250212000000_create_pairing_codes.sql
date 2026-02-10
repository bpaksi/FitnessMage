-- Ephemeral pairing codes: phone creates row, web claims it
CREATE TABLE pairing_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  device_name TEXT DEFAULT 'Mobile Device',
  device_type TEXT DEFAULT 'unknown',
  device_info JSONB DEFAULT '{}'::jsonb,
  claimed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_pairing_codes_code ON pairing_codes(code);
CREATE INDEX idx_pairing_codes_token ON pairing_codes(token);
ALTER TABLE pairing_codes ENABLE ROW LEVEL SECURITY;
