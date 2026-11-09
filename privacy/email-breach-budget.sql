-- Shards Privacy HIBP account lookup request-budget schema.
-- Applied to EU-jurisdiction D1 database shards-privacy-prod.
-- Deliberately stores no email addresses or email hashes.
CREATE TABLE IF NOT EXISTS email_breach_budget (
  window_type TEXT NOT NULL CHECK (window_type IN ('utc_day','utc_hour')),
  window_key TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count>=0),
  PRIMARY KEY(window_type,window_key)
);
CREATE INDEX IF NOT EXISTS idx_email_breach_window
  ON email_breach_budget(window_key);
