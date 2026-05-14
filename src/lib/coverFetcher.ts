/**
 * 从公开 API 搜索专辑/电影封面。
 * 音乐：iTunes（US 区）→ Cover Art Archive 双重兜底，均无需 Key
 * 电影：TMDB（需免费 Key）
 */

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

export interface CoverResult {
  url: string | null;
  source: 'itunes' | 'coverart' | 'tmdb' | 'none';
}

async function tryItunes(artist: string, album: string): Promise<string | null> {
  const query = encodeURIComponent(`${artist} ${album}`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.results?.length > 0 && json.results[0].artworkUrl100) {
      return json.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
    }
  } catch {}
  return null;
}

async function tryCoverArtArchive(artist: string, album: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`artist:"${artist}" AND release:"${album}"`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const mbRes = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=${query}&fmt=json&limit=1`,
      { signal: controller.signal, headers: { 'User-Agent': 'DazhuSite/1.0' } },
    );
    clearTimeout(timeout);
    if (!mbRes.ok) return null;
    const mbJson = await mbRes.json();
    if (!mbJson.releases?.length) return null;
    const mbid = mbJson.releases[0].id;

    const caRes = await fetch(`https://coverartarchive.org/release/${mbid}/front-250`);
    if (caRes.ok) return caRes.url;
  } catch {}
  return null;
}

export async function searchMusicCover(artist: string, album: string): Promise<CoverResult> {
  const itunesUrl = await tryItunes(artist, album);
  if (itunesUrl) return { url: itunesUrl, source: 'itunes' };

  const caUrl = await tryCoverArtArchive(artist, album);
  if (caUrl) return { url: caUrl, source: 'coverart' };

  return { url: null, source: 'none' };
}

export async function searchMovieCover(title: string): Promise<CoverResult> {
  if (!TMDB_KEY) return { url: null, source: 'none' };
  const query = encodeURIComponent(title);
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${query}&language=zh-CN`,
    );
    const json = await res.json();
    if (json.results?.length > 0 && json.results[0].poster_path) {
      const url = `https://image.tmdb.org/t/p/w500${json.results[0].poster_path}`;
      return { url, source: 'tmdb' };
    }
  } catch {}
  return { url: null, source: 'none' };
}
