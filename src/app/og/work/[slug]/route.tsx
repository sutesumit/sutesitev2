import { ImageResponse } from 'next/og';

import { projects } from '@/data/projectlist';
import { OG_IMAGE_SIZE, OgCard } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return new ImageResponse(
    <OgCard
      eyebrow="Work"
      title={project?.title ?? 'Project Not Found'}
      description={project?.description ?? 'This project could not be found.'}
      footerLeft="sumitsute.com/work"
      footerRight={project?.slug ?? slug}
      accentColor="#0ea5e9"
      background="linear-gradient(135deg, #082f49 0%, #0f172a 100%)"
      textColor="#e2e8f0"
      mutedColor="#cbd5e1"
    />,
    OG_IMAGE_SIZE
  );
}
