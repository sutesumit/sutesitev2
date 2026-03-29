import { projects } from '@/data/projectlist';
import { createOgImageResponse, ProjectOgCard } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return createOgImageResponse(
    <ProjectOgCard
      title={project?.title ?? 'Project Not Found'}
      description={project?.description ?? 'This project could not be found.'}
      footerLeft={`/work/${project?.slug ?? slug}`}
      footerRight={project?.slug ?? slug}
    />
  );
}
