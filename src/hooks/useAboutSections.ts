import { useState, useEffect, useCallback } from 'react';
import { supabase, type AboutSectionRecord } from '@/lib/supabase';

export interface AboutSection {
  id: string;
  section_key: string;
  title: string;
  content: string;
  sort_order: number;
}

function toSection(r: AboutSectionRecord): AboutSection {
  return {
    id: r.id,
    section_key: r.section_key,
    title: r.title,
    content: r.content,
    sort_order: r.sort_order,
  };
}

export function useAboutSections() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('about_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setSections((data as AboutSectionRecord[]).map(toSection));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { sections, loading, refresh: fetch };
}

export async function updateAboutSection(
  id: string,
  updates: { title?: string; content?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from('about_sections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('updateAboutSection error:', error);
    return false;
  }
  return true;
}
