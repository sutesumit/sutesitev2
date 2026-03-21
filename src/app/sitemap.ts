import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/metadata';
import { getBloqPosts } from '@/lib/bloq';
import { projects } from '@/data/projectlist';
import { getSupabaseServerClient } from '@/lib/supabaseServerClient';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
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
  const bloqPages: MetadataRoute.Sitemap = bloqPosts.map((post) => ({
    url: `${SITE_URL}/bloq/${post.url}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const supabase = getSupabaseServerClient();

  const { data: bytes } = await supabase
    .from('bytes')
    .select('byte_serial, created_at')
    .order('created_at', { ascending: false });

  const bytePages: MetadataRoute.Sitemap = (bytes ?? []).map((byte) => ({
    url: `${SITE_URL}/byte/${byte.byte_serial}`,
    lastModified: new Date(byte.created_at),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  const { data: blips } = await supabase
    .from('blips')
    .select('blip_serial, created_at, updated_at')
    .order('created_at', { ascending: false });

  const blipPages: MetadataRoute.Sitemap = (blips ?? []).map((blip) => ({
    url: `${SITE_URL}/blip/${blip.blip_serial}`,
    lastModified: new Date(blip.updated_at || blip.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...bloqPages, ...projectPages, ...bytePages, ...blipPages];
}
