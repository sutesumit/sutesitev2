import { NextResponse } from 'next/server';

import {
  PROJECTS_SITEMAP_LAST_MODIFIED,
  STATIC_SITEMAP_LAST_MODIFIED,
  staticPageMetadata,
} from '@/config/metadata';
import { projects } from '@/data/projectlist';
import { getBloqPosts } from '@/lib/bloq';
import { getSupabaseServerClient } from '@/lib/supabaseServerClient';
import { buildCanonicalUrl } from '@/lib/metadata/builders';

export const revalidate = 21600;

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}

function formatFrequency(freq: string): string {
  const map: Record<string, string> = {
    'always': 'always',
    'hourly': 'hourly',
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly',
    'yearly': 'yearly',
    'never': 'never',
  };
  return map[freq] || 'monthly';
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function entryToXml(entry: SitemapEntry): string {
  return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${formatFrequency(entry.changeFrequency)}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

export async function GET() {
  const staticPages: SitemapEntry[] = [
    {
      url: buildCanonicalUrl(staticPageMetadata.home.path),
      lastModified: new Date(STATIC_SITEMAP_LAST_MODIFIED),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: buildCanonicalUrl(staticPageMetadata.about.path),
      lastModified: new Date(STATIC_SITEMAP_LAST_MODIFIED),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl(staticPageMetadata.work.path),
      lastModified: new Date(STATIC_SITEMAP_LAST_MODIFIED),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl(staticPageMetadata.bloq.path),
      lastModified: new Date(STATIC_SITEMAP_LAST_MODIFIED),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl(staticPageMetadata.byte.path),
      lastModified: new Date(STATIC_SITEMAP_LAST_MODIFIED),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl(staticPageMetadata.blip.path),
      lastModified: new Date(STATIC_SITEMAP_LAST_MODIFIED),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  const bloqPosts = getBloqPosts();
  const bloqPages: SitemapEntry[] = bloqPosts.map((post) => ({
    url: buildCanonicalUrl(`/bloq/${post.url}`),
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const projectPages: SitemapEntry[] = projects.map((project) => ({
    url: buildCanonicalUrl(`/work/${project.slug}`),
    lastModified: new Date(PROJECTS_SITEMAP_LAST_MODIFIED),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const supabase = getSupabaseServerClient();

  const { data: bytes } = await supabase
    .from('bytes')
    .select('byte_serial, created_at')
    .order('created_at', { ascending: false });

  const bytePages: SitemapEntry[] = (bytes ?? []).map((byte) => ({
    url: buildCanonicalUrl(`/byte/${byte.byte_serial}`),
    lastModified: new Date(byte.created_at),
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  const { data: blips } = await supabase
    .from('blips')
    .select('blip_serial, created_at, updated_at')
    .order('created_at', { ascending: false });

  const blipPages: SitemapEntry[] = (blips ?? []).map((blip) => ({
    url: buildCanonicalUrl(`/blip/${blip.blip_serial}`),
    lastModified: new Date(blip.updated_at || blip.created_at),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const allEntries = [...staticPages, ...bloqPages, ...projectPages, ...bytePages, ...blipPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(entryToXml).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=21600, s-maxage=21600',
    },
  });
}
