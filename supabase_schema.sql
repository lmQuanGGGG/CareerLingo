-- Chạy đoạn mã này trong mục SQL Editor trên trang chủ Supabase

create table public.user_progress (
  id uuid references auth.users not null primary key,
  xp integer default 0,
  streak integer default 0,
  last_active_date date,
  completed_days jsonb default '[]'::jsonb,
  day_tasks jsonb default '{}'::jsonb,
  favorites jsonb default '[]'::jsonb,
  ai_scenarios jsonb default '[]'::jsonb,
  ai_lessons jsonb default '{}'::jsonb,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật Row Level Security (RLS) để bảo mật dữ liệu
alter table public.user_progress enable row level security;

-- Cho phép người dùng tạo dữ liệu của chính họ
create policy "Users can insert their own progress."
  on user_progress for insert
  with check ( auth.uid() = id );

-- Cho phép người dùng xem dữ liệu của chính họ
create policy "Users can view own progress."
  on user_progress for select
  using ( auth.uid() = id );

-- Cho phép người dùng cập nhật dữ liệu của chính họ
create policy "Users can update own progress."
  on user_progress for update
  using ( auth.uid() = id );

-- Hàm tự động tạo profile khi có người đăng ký mới (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_progress (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tạo View xếp hạng tự động bỏ qua RLS để ai cũng xem được TOP 10
drop view if exists public.leaderboard_view;

create view public.leaderboard_view as
select id, display_name, avatar_url, xp, streak
from public.user_progress
order by xp desc;

-- Cấp quyền đọc View này cho tất cả mọi người
grant select on public.leaderboard_view to anon, authenticated;

-- ==========================================
-- LIVE CHAT FEATURE SCHEMA
-- ==========================================

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users not null,
  receiver_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật Row Level Security cho bảng messages
alter table public.messages enable row level security;

-- Cho phép người gửi tạo tin nhắn
create policy "Users can send messages"
  on messages for insert
  with check ( auth.uid() = sender_id );

-- Cho phép người nhận và người gửi xem tin nhắn
create policy "Users can read own messages"
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

-- View an toàn để tìm kiếm người dùng (chỉ lấy id, tên, avatar)
drop view if exists public.chat_users_view;
create view public.chat_users_view as
select id, display_name, avatar_url
from public.user_progress;

grant select on public.chat_users_view to anon, authenticated;
