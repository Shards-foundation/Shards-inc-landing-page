PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS customer_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','closed')),
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customer_accounts(id),
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe','paypal')),
  external_subscription_id TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK (state IN ('pending','active','past_due','cancelled','refunded')),
  current_period_end TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(customer_id,payment_provider,external_subscription_id)
);
CREATE TABLE IF NOT EXISTS email_aliases (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customer_accounts(id),
  address TEXT NOT NULL UNIQUE,
  routing_provider TEXT NOT NULL DEFAULT 'cloudflare',
  route_id TEXT UNIQUE,
  state TEXT NOT NULL CHECK(state IN ('provisioning','active','suspended','revoked','failed')),
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_email_alias_customer ON email_aliases(customer_id,created_at);
CREATE TABLE IF NOT EXISTS phone_allocations (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customer_accounts(id),
  provider TEXT NOT NULL,
  provider_number_id TEXT UNIQUE,
  e164_number TEXT UNIQUE,
  state TEXT NOT NULL CHECK(state IN ('pending','compliance_review','active','released','failed')),
  compliance_checked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS vpn_peers (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customer_accounts(id),
  gateway_id TEXT NOT NULL,
  public_key TEXT NOT NULL UNIQUE,
  assigned_ip TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('pending','active','revoked','failed')),
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE TABLE IF NOT EXISTS webhook_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  handled_at TEXT,
  outcome TEXT,
  PRIMARY KEY(provider,event_id)
);
CREATE TABLE IF NOT EXISTS provision_jobs (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customer_accounts(id),
  product TEXT NOT NULL CHECK(product IN ('email','phone','vpn')),
  operation TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK(state IN ('queued','running','completed','failed','reconcile')),
  external_ref TEXT,
  error_code TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  created_at TEXT NOT NULL,
  details_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_events(actor_id,created_at);