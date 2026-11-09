-- Shards Security Sentinel: EU-jurisdiction Cloudflare D1.
-- Applied 2026-11-09 to shards-security-prod.
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS tenants (
 tenant_id TEXT PRIMARY KEY,
 display_name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended')),
 created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO tenants(tenant_id, display_name, status, created_at)
VALUES('shards-internal','Shards internal production sensor','active',datetime('now'));
CREATE TABLE IF NOT EXISTS decoy_events (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id),
 day TEXT NOT NULL,
 hour_bucket TEXT NOT NULL,
 received_at TEXT NOT NULL,
 family TEXT NOT NULL,
 method TEXT NOT NULL,
 rule_id TEXT NOT NULL,
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
 country TEXT NOT NULL,
 colo TEXT NOT NULL,
 action TEXT NOT NULL DEFAULT 'decoy_response'
);
CREATE INDEX IF NOT EXISTS idx_decoy_hour ON decoy_events(hour_bucket);
CREATE INDEX IF NOT EXISTS idx_decoy_tenant_time ON decoy_events(tenant_id,received_at DESC);
CREATE TABLE IF NOT EXISTS decoy_deployments (
 deployment_id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id),
 hostname TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL CHECK(status IN ('planned','active','disabled')),
 created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO decoy_deployments(deployment_id,tenant_id,hostname,status,created_at)
VALUES('internal-cf','shards-internal','trap.shardsinc.co.uk','active',datetime('now'));
