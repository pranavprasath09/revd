-- Sprint 4: Community Forums
-- ─────────────────────────────────────────────

-- Communities
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  banner_image text,
  member_count integer default 0,
  created_at timestamptz default now()
);

alter table communities enable row level security;

create policy "Communities are viewable by everyone"
  on communities for select using (true);

create policy "Authenticated users can insert communities"
  on communities for insert with check (auth.uid() is not null);

create policy "Only admins can delete communities"
  on communities for delete using (false);

-- Posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  image_url text,
  upvotes integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Posts are viewable by everyone"
  on posts for select using (true);

create policy "Authenticated users can create posts"
  on posts for insert with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on posts for delete using (auth.uid() = author_id);

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  body text not null,
  upvotes integer default 0,
  created_at timestamptz default now()
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone"
  on comments for select using (true);

create policy "Authenticated users can create comments"
  on comments for insert with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = author_id);

-- Post Votes
create table if not exists post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  unique(post_id, user_id)
);

alter table post_votes enable row level security;

create policy "Post votes are viewable by everyone"
  on post_votes for select using (true);

create policy "Authenticated users can vote on posts"
  on post_votes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own post votes"
  on post_votes for delete using (auth.uid() = user_id);

-- Comment Votes
create table if not exists comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid references comments(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  unique(comment_id, user_id)
);

alter table comment_votes enable row level security;

create policy "Comment votes are viewable by everyone"
  on comment_votes for select using (true);

create policy "Authenticated users can vote on comments"
  on comment_votes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own comment votes"
  on comment_votes for delete using (auth.uid() = user_id);

-- Community Members
create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(community_id, user_id)
);

alter table community_members enable row level security;

create policy "Community members are viewable by everyone"
  on community_members for select using (true);

create policy "Authenticated users can join communities"
  on community_members for insert with check (auth.uid() = user_id);

create policy "Users can leave communities"
  on community_members for delete using (auth.uid() = user_id);

-- Seed communities
insert into communities (name, slug, description, icon) values
  ('JDM', 'jdm', 'Japanese Domestic Market — Supras, GTRs, Silvias, and everything from the land of the rising sun.', '🇯🇵'),
  ('European', 'european', 'BMWs, Porsches, AMGs, and all things Euro. Performance meets precision.', '🇪🇺'),
  ('American Muscle', 'american-muscle', 'Mustangs, Camaros, Challengers, and the raw V8 power that shakes the ground.', '🇺🇸'),
  ('Trucks & Off-Road', 'trucks-off-road', 'Lifted trucks, overlanding rigs, and off-road builds. Dirt is a badge of honor.', '🏔️'),
  ('Photography', 'photography', 'Share your car photography tips, gear, and behind-the-scenes stories.', '📸'),
  ('Builds & Mods', 'builds-mods', 'Document your build, share mod lists, and get advice from fellow builders.', '🔧')
on conflict (slug) do nothing;
