-- ============================================================
-- 大猪个人网站 — 添加 content_format 列
-- 在 Supabase SQL Editor 中执行此文件
-- https://supabase.com/dashboard/project/vkxijhmeyjtmtldxpfin/sql/new
-- ============================================================

ALTER TABLE essays ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'markdown';
ALTER TABLE notes  ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'markdown';
