CREATE TABLE merchants (
 id uuid PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
 token_hash text PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_merchant ON sessions(merchant_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE stores (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL UNIQUE REFERENCES merchants(id), name varchar(100) NOT NULL,
 network text NOT NULL CHECK(network IN ('mainnet','chipnet')), receive_xpub text,
 address_index integer NOT NULL DEFAULT 0 CHECK(address_index>=0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE wallet_addresses (
 id uuid PRIMARY KEY, store_id uuid NOT NULL REFERENCES stores(id), network text NOT NULL,
 address text NOT NULL, address_index integer NOT NULL, path text NOT NULL DEFAULT 'receive',
 ownership_status text NOT NULL DEFAULT 'unverified' CHECK(ownership_status IN ('unverified','spend_proven')),
 proof_txid text, UNIQUE(network,address), UNIQUE(store_id,path,address_index)
);
CREATE TABLE orders (
 id uuid PRIMARY KEY, store_id uuid NOT NULL REFERENCES stores(id), capability_hash text NOT NULL UNIQUE,
 title varchar(160) NOT NULL, reference text NOT NULL UNIQUE, network text NOT NULL CHECK(network IN ('mainnet','chipnet')),
 address text NOT NULL, address_index integer NOT NULL, amount bigint NOT NULL CHECK(amount BETWEEN 546 AND 2100000000000000),
 state text NOT NULL DEFAULT 'awaiting_payment' CHECK(state IN ('awaiting_payment','unconfirmed','confirmed','review_required','expired','cancelled')),
 reserved bigint NOT NULL DEFAULT 0 CHECK(reserved>=0), settled bigint NOT NULL DEFAULT 0 CHECK(settled>=0),
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(reserved+settled<=amount), UNIQUE(network,address)
);
CREATE INDEX orders_store_created ON orders(store_id,created_at DESC);
CREATE TABLE payments (
 id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE REFERENCES orders(id), network text NOT NULL,
 txid text NOT NULL CHECK(txid ~ '^[a-f0-9]{64}$'), vout integer NOT NULL CHECK(vout>=0), amount bigint NOT NULL CHECK(amount>=546),
 confirmations integer NOT NULL DEFAULT 0 CHECK(confirmations>=0), block_hash text, block_height integer,
 state text NOT NULL CHECK(state IN ('unconfirmed','confirmed','review_required')),
 evidence jsonb NOT NULL, observed_at timestamptz NOT NULL DEFAULT now(), checked_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(network,txid,vout)
);
CREATE TABLE refunds (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id), amount bigint NOT NULL CHECK(amount>=546),
 address text NOT NULL, reason varchar(1000) NOT NULL,
 state text NOT NULL DEFAULT 'requested' CHECK(state IN ('requested','approved','rejected','awaiting_signature','signed','broadcast_unknown','broadcast','unconfirmed','confirmed','review_required')),
 decision_note varchar(1000), decided_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refunds_order ON refunds(order_id);
CREATE INDEX refunds_state ON refunds(state);
CREATE TABLE attempts (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id), refund_id uuid REFERENCES refunds(id),
 kind text NOT NULL CHECK(kind IN ('payment','refund')), network text NOT NULL,
 state text NOT NULL DEFAULT 'awaiting_signature' CHECK(state IN ('awaiting_signature','cancelled','signed','broadcast_unknown','broadcast','unconfirmed','confirmed','review_required')),
 plan jsonb NOT NULL, raw_tx text, txid text, confirmations integer NOT NULL DEFAULT 0,
 block_hash text, evidence jsonb, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((raw_tx IS NULL AND txid IS NULL) OR (raw_tx IS NOT NULL AND txid IS NOT NULL)), UNIQUE(network,txid)
);
CREATE UNIQUE INDEX attempts_active_refund ON attempts(refund_id) WHERE state<>'cancelled';
CREATE UNIQUE INDEX attempts_active_payment ON attempts(order_id) WHERE kind='payment' AND state<>'cancelled';
CREATE TABLE input_reservations (
 network text NOT NULL, txid text NOT NULL, vout integer NOT NULL, attempt_id uuid NOT NULL REFERENCES attempts(id),
 PRIMARY KEY(network,txid,vout)
);
CREATE INDEX reservations_attempt ON input_reservations(attempt_id);
CREATE TABLE refund_settlements (
 refund_id uuid PRIMARY KEY REFERENCES refunds(id), attempt_id uuid NOT NULL UNIQUE REFERENCES attempts(id),
 amount bigint NOT NULL CHECK(amount>=546), txid text NOT NULL, settled_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE idempotency (
 scope text NOT NULL, key text NOT NULL, fingerprint text NOT NULL, response jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(scope,key)
);
CREATE TABLE audit_events (
 id bigserial PRIMARY KEY, store_id uuid NOT NULL REFERENCES stores(id), order_id uuid REFERENCES orders(id),
 action text NOT NULL, actor text NOT NULL, detail jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_order ON audit_events(order_id,id);
CREATE TABLE rate_limits (
 bucket text PRIMARY KEY, count integer NOT NULL, reset_at timestamptz NOT NULL
);
