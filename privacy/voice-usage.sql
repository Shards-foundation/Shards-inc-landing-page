-- Shards Voice Studio / EU-jurisdiction D1
-- Applied to shards-voice-prod on 2026-11-09.
CREATE TABLE IF NOT EXISTS voice_usage (
  subject_hash TEXT NOT NULL,
  day TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('tts_chars','stt_jobs')),
  units INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(subject_hash, day, operation)
);
CREATE INDEX IF NOT EXISTS idx_voice_usage_day ON voice_usage(day, operation);
