-- 在 Supabase SQL Editor 中执行此文件，一键建表

-- 音乐表
CREATE TABLE music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 4,
  review TEXT NOT NULL DEFAULT '',
  link TEXT,
  cover_colors TEXT[] NOT NULL DEFAULT ARRAY['#1a1a2a', '#4a5a6a'],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 电影表
CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  director TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating INTEGER NOT NULL DEFAULT 4,
  review TEXT NOT NULL DEFAULT '',
  link TEXT,
  cover_colors TEXT[] NOT NULL DEFAULT ARRAY['#1a1a2a', '#4a5a6a'],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 笔记表
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'dev',
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 随笔表
CREATE TABLE essays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'essay',
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 照片表
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  cover_colors TEXT[] NOT NULL DEFAULT ARRAY['#6a5a4a', '#1a1a2a'],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 启用行级安全 + 允许公开访问（个人网站，所有人可读，写操作需要 anon key）
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（anon key 即可读）
CREATE POLICY "Allow public read" ON music FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON movies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON essays FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON photos FOR SELECT USING (true);

-- 允许 anon 插入（匿名用户可通过网站表单添加内容）
CREATE POLICY "Allow anon insert" ON music FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON movies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON essays FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON photos FOR INSERT WITH CHECK (true);

-- 允许 anon 更新（匿名用户可通过网站编辑内容）
CREATE POLICY "Allow anon update" ON music FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon update" ON movies FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon update" ON notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon update" ON essays FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon update" ON photos FOR UPDATE USING (true) WITH CHECK (true);

-- 允许 anon 删除（匿名用户可通过网站删除内容）
CREATE POLICY "Allow anon delete" ON music FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON movies FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON notes FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON essays FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON photos FOR DELETE USING (true);
