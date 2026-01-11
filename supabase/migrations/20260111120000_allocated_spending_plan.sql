-- Allocated Spending Plan (check register) history
-- Stores each uploaded plan as a versioned snapshot, with per-pay-date amounts.

CREATE TABLE IF NOT EXISTS allocated_spending_plan_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file_name TEXT NOT NULL,
  note TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allocated_spending_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES allocated_spending_plan_uploads(id) ON DELETE CASCADE,
  account TEXT NOT NULL,
  pay_date DATE,
  header_label TEXT,
  amount NUMERIC,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE allocated_spending_plan_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocated_spending_plan_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own spending plan uploads"
  ON allocated_spending_plan_uploads
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own spending plan entries"
  ON allocated_spending_plan_entries
  FOR ALL
  USING (auth.uid() = user_id);
