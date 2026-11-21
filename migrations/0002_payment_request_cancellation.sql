-- Cancellation is permanent; orders and receiving destinations are never deleted.
CREATE TABLE order_cancellations (
 order_id uuid PRIMARY KEY REFERENCES orders(id),
 cancelled_at timestamptz NOT NULL DEFAULT now(),
 checked_at timestamptz NOT NULL DEFAULT now(),
 review_required boolean NOT NULL DEFAULT false
);
CREATE INDEX cancellations_check ON order_cancellations(checked_at);
