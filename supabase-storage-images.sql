-- ============================================================
-- 大猪个人网站 — 图片存储桶 RLS 策略
-- 先在 Supabase Dashboard > Storage 手动创建 content-images 桶（公开）
-- 然后执行此文件
-- https://supabase.com/dashboard/project/vkxijhmeyjtmtldxpfin/sql/new
-- ============================================================

-- 允许任何人读取图片
DROP POLICY IF EXISTS "Public read content-images" ON storage.objects;
CREATE POLICY "Public read content-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

-- 允许已认证用户上传图片
DROP POLICY IF EXISTS "Auth upload content-images" ON storage.objects;
CREATE POLICY "Auth upload content-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'content-images'
  AND auth.role() = 'authenticated'
);

-- 允许已认证用户更新图片
DROP POLICY IF EXISTS "Auth update content-images" ON storage.objects;
CREATE POLICY "Auth update content-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'content-images'
  AND auth.role() = 'authenticated'
);

-- 允许已认证用户删除图片
DROP POLICY IF EXISTS "Auth delete content-images" ON storage.objects;
CREATE POLICY "Auth delete content-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'content-images'
  AND auth.role() = 'authenticated'
);
