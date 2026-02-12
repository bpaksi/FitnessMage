-- Fix overly permissive device_tokens RLS policy.
-- The old "Service role manages device tokens" policy used FOR ALL USING (true),
-- which allowed any authenticated user to read/modify any token.
-- Replace with scoped policies: authenticated users can only update/delete their own tokens.
-- INSERT stays admin-only (pairing claim flow uses the service role).

DROP POLICY IF EXISTS "Service role manages device tokens" ON device_tokens;

CREATE POLICY "Users can update own device tokens" ON device_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own device tokens" ON device_tokens
  FOR DELETE USING (auth.uid() = user_id);
