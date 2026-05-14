import { useState, useEffect, useCallback } from 'react';
import { supabase, type MusicRecord } from '@/lib/supabase';

export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  rating: number;
  review: string;
  link?: string;
  coverUrl: string | null;
  coverColors: [string, string];
  createdAt?: string;
}

function toItem(r: MusicRecord): MusicItem {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    year: r.year,
    genre: r.genre,
    rating: r.rating,
    review: r.review,
    link: r.link || undefined,
    coverUrl: r.cover_url || null,
    coverColors: (r.cover_colors?.length === 2 ? r.cover_colors : ['#1a1a2a', '#4a5a6a']) as [string, string],
    createdAt: r.created_at,
  };
}

export function useMusic() {
  const [items, setItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('music').select('*').order('created_at', { ascending: false });
    if (data) setItems((data as MusicRecord[]).map(toItem));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, refresh: fetch };
}

export async function addMusic(item: Omit<MusicItem, 'id'>): Promise<void> {
  await supabase.from('music').insert({
    title: item.title,
    artist: item.artist,
    year: item.year,
    genre: item.genre,
    rating: item.rating,
    review: item.review,
    link: item.link || null,
    cover_url: item.coverUrl || null,
    cover_colors: item.coverColors,
  });
}

export async function deleteMusic(id: string): Promise<boolean> {
  const { error } = await supabase.from('music').delete().eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}
