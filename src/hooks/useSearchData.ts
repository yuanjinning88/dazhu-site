import { useState, useEffect } from 'react';
import { supabase, type MusicRecord, type MovieRecord, type NoteRecord, type EssayRecord, type PhotoRecord } from '@/lib/supabase';

export interface SearchableItem {
  id: string;
  type: 'essay' | 'music' | 'movie' | 'note' | 'photo';
  title: string;
  subtitle: string;
  searchText: string;
  url: string;
}

function buildIndex(
  essays: EssayRecord[],
  music: MusicRecord[],
  movies: MovieRecord[],
  notes: NoteRecord[],
  photos: PhotoRecord[],
): SearchableItem[] {
  const results: SearchableItem[] = [];

  for (const e of essays) {
    results.push({
      id: e.id,
      type: 'essay',
      title: e.title,
      subtitle: e.description || e.category || '',
      searchText: [e.title, e.description, e.category, e.content].filter(Boolean).join(' ').toLowerCase(),
      url: `/essays/${e.id}`,
    });
  }

  for (const m of music) {
    results.push({
      id: m.id,
      type: 'music',
      title: m.title,
      subtitle: `${m.artist} · ${m.year}`,
      searchText: [m.title, m.artist, m.genre, m.review].filter(Boolean).join(' ').toLowerCase(),
      url: `/music/${m.id}`,
    });
  }

  for (const m of movies) {
    const displayTitle = m.title_zh ? `${m.title_zh} / ${m.title}` : m.title;
    results.push({
      id: m.id,
      type: 'movie',
      title: displayTitle,
      subtitle: `${m.director} · ${m.year}`,
      searchText: [m.title, m.title_zh, m.director, m.review].filter(Boolean).join(' ').toLowerCase(),
      url: `/movies/${m.id}`,
    });
  }

  for (const n of notes) {
    results.push({
      id: n.id,
      type: 'note',
      title: n.title,
      subtitle: n.description || n.tags?.join(' · ') || '',
      searchText: [n.title, n.description, n.content, ...(n.tags || [])].filter(Boolean).join(' ').toLowerCase(),
      url: `/notes/${n.id}`,
    });
  }

  for (const p of photos) {
    results.push({
      id: p.id,
      type: 'photo',
      title: p.title,
      subtitle: p.date || '',
      searchText: [p.title, p.date].filter(Boolean).join(' ').toLowerCase(),
      url: '/photos',
    });
  }

  return results;
}

export function useSearchData() {
  const [index, setIndex] = useState<SearchableItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [essaysRes, musicRes, moviesRes, notesRes, photosRes] = await Promise.all([
        supabase.from('essays').select('id,title,description,category,content'),
        supabase.from('music').select('id,title,artist,year,genre,review'),
        supabase.from('movies').select('id,title,title_zh,director,year,review'),
        supabase.from('notes').select('id,title,description,content,tags'),
        supabase.from('photos').select('id,title,date'),
      ]);

      if (cancelled) return;

      setIndex(buildIndex(
        (essaysRes.data || []) as EssayRecord[],
        (musicRes.data || []) as MusicRecord[],
        (moviesRes.data || []) as MovieRecord[],
        (notesRes.data || []) as NoteRecord[],
        (photosRes.data || []) as PhotoRecord[],
      ));
      setReady(true);
    }

    load();

    return () => { cancelled = true; };
  }, []);

  return { index, ready };
}
