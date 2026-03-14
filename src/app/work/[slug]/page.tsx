import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/data/projectlist";
import ProjectPage from "../components/ProjectPage";
import TrackProjectView from "../components/TrackProjectView";
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from "@/config/metadata";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  
  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `${SITE_URL}/work/${slug}` },
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${SITE_URL}/work/${slug}`,
      siteName: SITE_NAME,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
    },
  };
}

function ProjectJsonLd({ project }: { project: typeof projects[0] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/work/${project.slug}`,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <>
      <ProjectJsonLd project={project} />
      <TrackProjectView slug={slug} />
      <ProjectPage project={project} />
    </>
  );
}
