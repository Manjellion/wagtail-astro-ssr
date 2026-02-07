type WagtailPage = {
  id: number;
  title: string;
  meta: {
    seo_title?: string;
    search_description?: string;
    html_url?: string;
    slug?: string;
  };
  body?: any; // StreamField JSON (if exposed)
};

const API_BASE = import.meta.env.WAGTAIL_API_BASE_URL; // e.g. https://cms.example.com
const API_PREFIX = import.meta.env.WAGTAIL_API_PREFIX ?? "/api/v2";

const cache = new Map<string, { expires: number; data: any }>();
const TTL_MS = 30_000;

function cacheGet(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) return null;
  return hit.data;
}
function cacheSet(key: string, data: any) {
  cache.set(key, { expires: Date.now() + TTL_MS, data });
}

export async function getPageByPath(pathname: string): Promise<WagtailPage | null> {
  if (!API_BASE) throw new Error("Missing WAGTAIL_API_BASE_URL");

  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const key = `page:${normalized}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = new URL(`${API_PREFIX}/pages/find/`, API_BASE);
  url.searchParams.set("html_path", normalized);

  // fetch() will follow the 302 to /api/v2/pages/<id>/ by default
  const res = await fetch(url, { redirect: "follow", headers: { Accept: "application/json" } });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Wagtail API error ${res.status}`);

  const data = (await res.json()) as WagtailPage;
  cacheSet(key, data);
  return data;
}