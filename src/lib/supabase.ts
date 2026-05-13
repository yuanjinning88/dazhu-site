import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MusicRecord {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  rating: number;
  review: string;
  link: string | null;
  cover_url: string | null;
  cover_colors: string[];
  created_at: string;
}

export interface MovieRecord {
  id: string;
  title: string;
  title_zh: string;
  director: string;
  year: number;
  rating: number;
  review: string;
  link: string | null;
  cover_url: string | null;
  cover_colors: string[];
  created_at: string;
}

export interface NoteRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  difficulty: string;
  reading_time: number;
  created_at: string;
}

export interface EssayRecord {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  content: string;
  created_at: string;
}

export interface PhotoRecord {
  id: string;
  title: string;
  date: string;
  image_url: string | null;
  cover_colors: string[];
  created_at: string;
}
