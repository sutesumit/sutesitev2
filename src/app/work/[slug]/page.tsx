import { notFound } from "next/navigation";
import { projects } from "@/data/projectlist";
import ProjectPage from "../components/ProjectPage";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return <ProjectPage project={project} />;
}
