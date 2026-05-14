interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const doubanUrl = url.searchParams.get('url');

  if (!doubanUrl) {
    return new Response(JSON.stringify({ error: 'Missing "url" parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!doubanUrl.includes('douban.com')) {
    return new Response(JSON.stringify({ error: 'Not a valid Douban URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(doubanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DazhuSite/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ coverUrl: null, error: `Douban returned ${response.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const html = await response.text();

    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return new Response(JSON.stringify({ coverUrl: ogImageMatch[1] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    const posterMatch = html.match(/<img[^>]+src="([^"]+)"[^>]+(?:alt="(?:poster|电影海报)")/i);
    if (posterMatch && posterMatch[1]) {
      return new Response(JSON.stringify({ coverUrl: posterMatch[1] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new Response(JSON.stringify({ coverUrl: null, error: 'No cover image found on page' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ coverUrl: null, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
