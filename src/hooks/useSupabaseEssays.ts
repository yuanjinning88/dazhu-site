import { useState, useEffect, useCallback } from 'react';
import { supabase, type EssayRecord } from '@/lib/supabase';

export interface EssayItem {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  content: string;
  createdAt: string;
}

function toItem(r: EssayRecord): EssayItem {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    category: r.category,
    description: r.description,
    content: r.content,
    createdAt: r.created_at,
  };
}

export function useSupabaseEssays() {
  const [items, setItems] = useState<EssayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('essays')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems((data as EssayRecord[]).map(toItem));
    if (error) console.error(error);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, refresh: fetch };
}

export function useSupabaseEssay(id: string | undefined) {
  const [essay, setEssay] = useState<EssayItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    supabase.from('essays').select('*').eq('id', id).single().then(({ data, error }) => {
      if (data) setEssay(toItem(data as EssayRecord));
      if (error) console.error(error);
      setLoading(false);
    });
  }, [id]);

  return { essay, loading };
}

export async function createEssay(title: string): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('essays')
    .insert({
      title,
      date: new Date().toISOString().split('T')[0],
      category: 'life',
      description: '',
      content: '',
    })
    .select('id')
    .single();

  if (error) {
    console.error(error);
    if (error.message.includes('does not exist')) {
      return { error: '数据库 essays 表尚未创建。请先在 Supabase SQL Editor 中执行建表 SQL。' };
    }
    if (error.message.includes('row-level security') || error.message.includes('policy')) {
      return { error: 'RLS 策略阻止了插入。请检查 essays 表的 INSERT policy。' };
    }
    if (error.message.includes('permission denied')) {
      return { error: '数据库权限不足。请在 Supabase SQL Editor 中执行 supabase-fix-essays.sql。' };
    }
    return { error: error.message };
  }
  return { id: (data as EssayRecord).id };
}

export async function updateEssay(id: string, updates: {
  title?: string;
  category?: string;
  description?: string;
  content?: string;
}): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase
    .from('essays')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error(error);
    if (error.message.includes('permission denied')) {
      return { error: '数据库权限不足。请在 Supabase SQL Editor 中执行 supabase-fix-essays.sql。' };
    }
    return { error: error.message };
  }
  return { ok: true };
}

export async function deleteEssay(id: string): Promise<boolean> {
  const { error } = await supabase.from('essays').delete().eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}

/** 尝试创建 essays 表（需要 service_role key，anon key 大概率没权限） */
export async function tryCreateEssaysTable(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('create_essays_table_if_needed' as any);
    return !error;
  } catch {
    return false;
  }
}
