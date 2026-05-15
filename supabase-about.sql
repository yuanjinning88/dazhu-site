-- ============================================================
-- 大猪个人网站 — 关于页面动态内容表
-- 在 Supabase SQL Editor 中执行此文件
-- https://supabase.com/dashboard/project/vkxijhmeyjtmtldxpfin/sql/new
-- ============================================================

-- 1. 建表
CREATE TABLE IF NOT EXISTS about_sections (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read about"   ON about_sections;
DROP POLICY IF EXISTS "Admin insert about" ON about_sections;
DROP POLICY IF EXISTS "Admin update about" ON about_sections;

CREATE POLICY "Public read about"   ON about_sections FOR SELECT USING (true);
CREATE POLICY "Admin insert about" ON about_sections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update about" ON about_sections FOR UPDATE USING (auth.role() = 'authenticated');

GRANT ALL ON TABLE about_sections TO anon, authenticated, service_role;

-- 3. 种子数据（仅当表为空时插入）
INSERT INTO about_sections (section_key, title, content, sort_order)
SELECT * FROM (VALUES
  ('hero_name',   '', 'Dazhu', 1),
  ('hero_intro',  '', '这里写一段关于你自己的简短介绍。', 2),
  ('contact',     '联系方式', 'hello@dazhu.dev', 3),
  ('about_site',  '关于本站', '["网站定位：这里写网站的定位说明。","内容来源：这里写内容的来源说明。","版权声明：这里写版权相关信息。"]', 4),
  ('about_me',    '关于我',   '["职业：这里写你的职业","爱好：这里写你的爱好","兴趣：这里写你的兴趣方向"]', 5),
  ('timeline',    '大事记',   '[{"date":"2024-01","text":"这里写事件描述。"},{"date":"2024-06","text":"这里写事件描述。"},{"date":"2025-01","text":"这里写事件描述。"}]', 6)
) AS seed(section_key, title, content, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM about_sections LIMIT 1);
