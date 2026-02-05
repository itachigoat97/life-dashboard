-- Paolo Life Dashboard — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  energy_level int check (energy_level between 1 and 10),
  notes text,
  created_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references days(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  completed boolean default true,
  created_at timestamptz default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  emoji text,
  target_per_week int default 7,
  created_at timestamptz default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean default false,
  unique(habit_id, date)
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_value numeric,
  current_value numeric default 0,
  unit text,
  category text,
  year int default 2026,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_activities_day_id on activities(day_id);
create index if not exists idx_habit_logs_habit_id on habit_logs(habit_id);
create index if not exists idx_habit_logs_date on habit_logs(date);
create index if not exists idx_goals_year on goals(year);
create index if not exists idx_days_date on days(date);

-- Enable Row Level Security (configure policies as needed)
alter table days enable row level security;
alter table activities enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table goals enable row level security;
