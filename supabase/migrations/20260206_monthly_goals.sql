-- Monthly Goals table
CREATE TABLE IF NOT EXISTS monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL DEFAULT 2026,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  category TEXT CHECK (category IN ('anima', 'mente', 'cuore', 'corpo', 'abito', 'portafoglio')),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year, title)
);

-- RLS
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on monthly_goals" ON monthly_goals FOR ALL USING (true) WITH CHECK (true);

-- Ensure update_updated_at function exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER monthly_goals_updated_at BEFORE UPDATE ON monthly_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monthly_goals_month_year ON monthly_goals(month, year);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_category ON monthly_goals(category);
