-- ============================================================
-- 大猪个人网站 — Supabase RLS 安全策略
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- 1. 开启所有表的 RLS (Row Level Security)
ALTER TABLE music  ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 2. 删除已有的策略（如存在），避免重复执行时报错
DROP POLICY IF EXISTS "Public read music"   ON music;
DROP POLICY IF EXISTS "Admin insert music"  ON music;
DROP POLICY IF EXISTS "Admin update music"  ON music;
DROP POLICY IF EXISTS "Admin delete music"  ON music;

DROP POLICY IF EXISTS "Public read movies"  ON movies;
DROP POLICY IF EXISTS "Admin insert movies" ON movies;
DROP POLICY IF EXISTS "Admin update movies" ON movies;
DROP POLICY IF EXISTS "Admin delete movies" ON movies;

DROP POLICY IF EXISTS "Public read notes"   ON notes;
DROP POLICY IF EXISTS "Admin insert notes"  ON notes;
DROP POLICY IF EXISTS "Admin update notes"  ON notes;
DROP POLICY IF EXISTS "Admin delete notes"  ON notes;

DROP POLICY IF EXISTS "Public read essays"  ON essays;
DROP POLICY IF EXISTS "Admin insert essays" ON essays;
DROP POLICY IF EXISTS "Admin update essays" ON essays;
DROP POLICY IF EXISTS "Admin delete essays" ON essays;

DROP POLICY IF EXISTS "Public read photos"  ON photos;
DROP POLICY IF EXISTS "Admin insert photos" ON photos;
DROP POLICY IF EXISTS "Admin update photos" ON photos;
DROP POLICY IF EXISTS "Admin delete photos" ON photos;

-- 3. 公开读取策略（任何人都可以浏览）
CREATE POLICY "Public read music"  ON music  FOR SELECT USING (true);
CREATE POLICY "Public read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read notes"  ON notes  FOR SELECT USING (true);
CREATE POLICY "Public read essays" ON essays FOR SELECT USING (true);
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);

-- 4. 管理员写入策略（只有登录用户才能增/改/删）
CREATE POLICY "Admin insert music" ON music  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update music" ON music  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete music" ON music  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert movies" ON movies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update movies" ON movies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete movies" ON movies FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert notes" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update notes" ON notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete notes" ON notes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert essays" ON essays FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update essays" ON essays FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete essays" ON essays FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert photos" ON photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update photos" ON photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete photos" ON photos FOR DELETE USING (auth.role() = 'authenticated');

-- 5. 授予权限（防止 "permission denied for table" 错误）
GRANT ALL ON TABLE music  TO anon, authenticated, service_role;
GRANT ALL ON TABLE movies TO anon, authenticated, service_role;
GRANT ALL ON TABLE notes  TO anon, authenticated, service_role;
GRANT ALL ON TABLE essays TO anon, authenticated, service_role;
GRANT ALL ON TABLE photos TO anon, authenticated, service_role;
