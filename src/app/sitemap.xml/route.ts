import { NextResponse } from 'next/server';
import { SITE_URL } from '@/config/metadata';
import { getBloqPosts } from '@/lib/bloq';
import { projects } from '@/data/projectlist';
import { getSupabaseServerClient } from '@/lib/supabaseServerClient';

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
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/bloq`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/byte`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blip`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  const bloqPosts = getBloqPosts();
  const bloqPages: SitemapEntry[] = bloqPosts.map((post) => ({
    url: `${SITE_URL}/bloq/${post.url}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const projectPages: SitemapEntry[] = projects.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const supabase = getSupabaseServerClient();

  const { data: bytes } = await supabase
    .from('bytes')
    .select('byte_serial, created_at')
    .order('created_at', { ascending: false });

  const bytePages: SitemapEntry[] = (bytes ?? []).map((byte) => ({
    url: `${SITE_URL}/byte/${byte.byte_serial}`,
    lastModified: new Date(byte.created_at),
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  const { data: blips } = await supabase
    .from('blips')
    .select('blip_serial, created_at, updated_at')
    .order('created_at', { ascending: false });

  const blipPages: SitemapEntry[] = (blips ?? []).map((blip) => ({
    url: `${SITE_URL}/blip/${blip.blip_serial}`,
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
