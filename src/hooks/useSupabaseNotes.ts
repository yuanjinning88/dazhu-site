import { useState, useEffect, useCallback } from 'react';
import { supabase, type NoteRecord } from '@/lib/supabase';

export type NoteStatus = 'inbox' | 'archived' | 'draft';

export const STATUS_LABEL: Record<NoteStatus, string> = { inbox: '待整理', archived: '已归档', draft: '草稿' };

export const STATUS_STYLE: Record<NoteStatus, string> = {
  inbox: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-gray-50 text-gray-500 border-gray-200',
};

export interface NoteItem {
  id: string;
  title: string;
  status: NoteStatus;
  description: string;
  content: string;
  contentFormat: string;
  tags: string[];
  source: string;
  createdAt: string;
}

function toItem(r: NoteRecord): NoteItem {
  return {
    id: r.id,
    title: r.title,
    status: (r.category as NoteStatus) || 'draft',
    description: r.description,
    content: r.content,
    contentFormat: r.content_format || 'markdown',
    tags: r.tags || [],
    source: r.difficulty || '',
    createdAt: r.created_at,
  };
}

export function useNotes() {
  const [items, setItems] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (data) setItems((data as NoteRecord[]).map(toItem));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, refresh: fetch };
}

export async function createNote(title: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      title: title || '无标题',
      category: 'draft',
      description: '',
      content: '',
      content_format: 'tiptap-json',
      tags: [],
      difficulty: '',
      reading_time: 0,
    })
    .select('id')
    .single();

  if (error) { console.error(error); return null; }
  return (data as NoteRecord).id;
}

export async function updateNote(id: string, updates: {
  title?: string;
  status?: NoteStatus;
  description?: string;
  content?: string;
  content_format?: string;
  tags?: string[];
  source?: string;
}): Promise<boolean> {
  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.status !== undefined) updateData.category = updates.status;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.content_format !== undefined) updateData.content_format = updates.content_format;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.source !== undefined) updateData.difficulty = updates.source;

  const { error } = await supabase.from('notes').update(updateData).eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}
