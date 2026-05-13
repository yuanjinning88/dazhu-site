import { useState, useEffect, useCallback } from 'react';
import { supabase, type NoteRecord } from '@/lib/supabase';

export interface NoteItem {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  difficulty: string;
  readingTime: number;
  createdAt: string;
}

function toItem(r: NoteRecord): NoteItem {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    content: r.content,
    tags: r.tags || [],
    difficulty: r.difficulty || '进阶',
    readingTime: r.reading_time || 5,
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

export async function addNote(item: {
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  difficulty: string;
  readingTime: number;
}): Promise<void> {
  await supabase.from('notes').insert({
    title: item.title,
    category: item.category,
    description: item.description,
    content: item.content,
    tags: item.tags,
    difficulty: item.difficulty,
    reading_time: item.readingTime,
  });
}
