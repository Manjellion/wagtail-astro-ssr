import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  // For a POC: list a subset via Wagtail API (pages endpoint)
  // You can improve later: paginate, filter only live/public, etc.
  const base = import.meta.env.WAGTAIL_API_BASE_URL;
  const apiPrefix = import.meta.env.WAGTAIL_API_PREFIX ?? "/api/v2";
  const site = import.meta.env.PUBLIC_SITE_URL;

  const res = await fetch(new URL(`${apiPrefix}/pages/?limit=100`, base));
  const data = await res.json();

  const urls = (data.items || [])
    .map((p: any) => p?.meta?.html_url)
    .filter(Boolean)
    .map((htmlUrl: string) => {
      // ensure sitemap uses your SSR domain, not CMS domain
      const path = new URL(htmlUrl).pathname;
      return new URL(path, site).toString();
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};