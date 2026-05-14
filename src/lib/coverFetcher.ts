/**
 * 搜索专辑/电影封面。
 * 音乐：iTunes（US 区）→ Cover Art Archive 双重兜底，均无需 Key
 * 电影：Cloudflare Pages Function 服务端抓取豆瓣页面 og:image
 */

export interface CoverResult {
  url: string | null;
  source: 'itunes' | 'coverart' | 'douban' | 'none';
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
    // 先通过 MusicBrainz 搜索 release MBID
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

    // 再用 MBID 取封面
    const caRes = await fetch(`https://coverartarchive.org/release/${mbid}/front-250`);
    if (caRes.ok) return caRes.url;
  } catch {}
  return null;
}

export async function searchMusicCover(artist: string, album: string): Promise<CoverResult> {
  // 优先 iTunes
  const itunesUrl = await tryItunes(artist, album);
  if (itunesUrl) return { url: itunesUrl, source: 'itunes' };

  // 兜底 Cover Art Archive
  const caUrl = await tryCoverArtArchive(artist, album);
  if (caUrl) return { url: caUrl, source: 'coverart' };

  return { url: null, source: 'none' };
}

export async function searchMovieCover(doubanUrl: string): Promise<CoverResult> {
  if (!doubanUrl) return { url: null, source: 'none' };
  try {
    const endpoint = `/api/douban-cover?url=${encodeURIComponent(doubanUrl)}`;
    const res = await fetch(endpoint);
    if (!res.ok) return { url: null, source: 'none' };
    const json = await res.json();
    if (json.coverUrl) return { url: json.coverUrl, source: 'douban' };
  } catch {}
  return { url: null, source: 'none' };
}
