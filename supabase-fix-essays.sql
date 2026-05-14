-- ============================================================
-- 修复 essays 表权限问题
-- 在 Supabase SQL Editor 中执行此文件
-- https://supabase.com/dashboard/project/vkxijhmeyjtmtldxpfin/sql/new
-- ============================================================

-- 1. 确保 RLS 已启用
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- 2. 删除所有旧策略（清理不一致状态）
DROP POLICY IF EXISTS "Allow public read"   ON essays;
DROP POLICY IF EXISTS "Allow anon insert"   ON essays;
DROP POLICY IF EXISTS "Allow anon update"   ON essays;
DROP POLICY IF EXISTS "Allow anon delete"   ON essays;
DROP POLICY IF EXISTS "Public read essays"  ON essays;
DROP POLICY IF EXISTS "Admin insert essays" ON essays;
DROP POLICY IF EXISTS "Admin update essays" ON essays;
DROP POLICY IF EXISTS "Admin delete essays" ON essays;

-- 3. 创建新策略
-- 公开读取
CREATE POLICY "Public read essays" ON essays FOR SELECT USING (true);

-- 登录用户可写入
CREATE POLICY "Admin insert essays" ON essays FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update essays" ON essays FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete essays" ON essays FOR DELETE USING (auth.role() = 'authenticated');

-- 4. 确保权限授予正确
GRANT ALL ON TABLE essays TO anon, authenticated, service_role;
