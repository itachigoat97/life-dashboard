-- Life Dashboard - Initial Schema
-- Created: 2026-02-05

-- Tabella giorni
create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  energy_level int check (energy_level between 1 and 10),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabella attività
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references days(id) on delete cascade,
  category text not null check (category in ('anima', 'mente', 'cuore', 'corpo', 'abito', 'portafoglio')),
  title text not null,
  description text,
  completed boolean default true,
  created_at timestamptz default now()
);

-- Tabella abitudini
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('anima', 'mente', 'cuore', 'corpo', 'abito', 'portafoglio')),
  emoji text,
  target_per_week int default 7,
  active boolean default true,
  created_at timestamptz default now()
);

-- Tabella tracking abitudini
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

-- Tabella goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  target_value numeric,
  current_value numeric default 0,
  unit text,
  category text check (category in ('anima', 'mente', 'cuore', 'corpo', 'abito', 'portafoglio')),
  year int default 2026,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabella Ruota della Vita (snapshot mensili)
create table if not exists wheel_of_life (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  anima int check (anima between 1 and 10),
  mente int check (mente between 1 and 10),
  cuore int check (cuore between 1 and 10),
  corpo int check (corpo between 1 and 10),
  abito int check (abito between 1 and 10),
  portafoglio int check (portafoglio between 1 and 10),
  created_at timestamptz default now()
);

-- Indici per performance
create index if not exists idx_days_date on days(date);
create index if not exists idx_activities_day_id on activities(day_id);
create index if not exists idx_activities_category on activities(category);
create index if not exists idx_habit_logs_date on habit_logs(date);
create index if not exists idx_habit_logs_habit_id on habit_logs(habit_id);

-- Row Level Security (allow all for now, auth later)
alter table days enable row level security;
alter table activities enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table goals enable row level security;
alter table wheel_of_life enable row level security;

-- Policies (allow all for now)
create policy "Allow all on days" on days for all using (true) with check (true);
create policy "Allow all on activities" on activities for all using (true) with check (true);
create policy "Allow all on habits" on habits for all using (true) with check (true);
create policy "Allow all on habit_logs" on habit_logs for all using (true) with check (true);
create policy "Allow all on goals" on goals for all using (true) with check (true);
create policy "Allow all on wheel_of_life" on wheel_of_life for all using (true) with check (true);

-- Trigger per updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger days_updated_at before update on days
  for each row execute function update_updated_at();

create trigger goals_updated_at before update on goals
  for each row execute function update_updated_at();
