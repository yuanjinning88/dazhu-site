import { useState, useEffect, useCallback } from 'react';
import { supabase, type MovieRecord } from '@/lib/supabase';

export interface MovieItem {
  id: string;
  title: string;
  titleZh: string;
  director: string;
  year: number;
  rating: number;
  review: string;
  link?: string;
  watchUrl?: string;
  coverUrl: string | null;
  posterColors: [string, string];
  createdAt?: string;
}

function toItem(r: MovieRecord): MovieItem {
  return {
    id: r.id,
    title: r.title,
    titleZh: r.title_zh,
    director: r.director,
    year: r.year,
    rating: r.rating,
    review: r.review,
    link: r.link || undefined,
    watchUrl: r.watch_url || undefined,
    coverUrl: r.cover_url || null,
    posterColors: (r.cover_colors?.length === 2 ? r.cover_colors : ['#1a1a2a', '#4a5a6a']) as [string, string],
    createdAt: r.created_at,
  };
}

export function useMovies() {
  const [items, setItems] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    if (data) setItems((data as MovieRecord[]).map(toItem));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, refresh: fetch };
}

export async function addMovie(item: Omit<MovieItem, 'id'>): Promise<void> {
  await supabase.from('movies').insert({
    title: item.title,
    title_zh: item.titleZh,
    director: item.director,
    year: item.year,
    rating: item.rating,
    review: item.review,
    link: item.link || null,
    watch_url: item.watchUrl || null,
    cover_url: item.coverUrl || null,
    cover_colors: item.posterColors,
  });
}

export async function deleteMovie(id: string): Promise<boolean> {
  const { error } = await supabase.from('movies').delete().eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}

export async function updateMovie(id: string, updates: Partial<Omit<MovieItem, 'id'>>): Promise<void> {
  const record: Record<string, unknown> = {};
  if (updates.title !== undefined) record.title = updates.title;
  if (updates.titleZh !== undefined) record.title_zh = updates.titleZh;
  if (updates.director !== undefined) record.director = updates.director;
  if (updates.year !== undefined) record.year = updates.year;
  if (updates.rating !== undefined) record.rating = updates.rating;
  if (updates.review !== undefined) record.review = updates.review;
  if (updates.link !== undefined) record.link = updates.link || null;
  if (updates.watchUrl !== undefined) record.watch_url = updates.watchUrl || null;
  if (updates.coverUrl !== undefined) record.cover_url = updates.coverUrl || null;
  if (updates.posterColors !== undefined) record.cover_colors = updates.posterColors;
  await supabase.from('movies').update(record).eq('id', id);
}
