import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TrackView from '@/components/shared/TrackView';
import { projects } from "@/data/projectlist";
import { buildDetailMetadata } from "@/lib/metadata/builders";
import { buildProjectSchema, renderJsonLd } from "@/lib/metadata/schema";

import ProjectPage from "../components/ProjectPage";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return buildDetailMetadata({
    title: project.title,
    description: project.description,
    path: `/work/${slug}`,
    ogType: 'website',
    generatedImagePath: `/work/${slug}/opengraph-image`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      {renderJsonLd(buildProjectSchema(project))}
      <TrackView type="project" identifier={slug} />
      <ProjectPage project={project} />
    </>
  );
}
