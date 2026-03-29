import type { Metadata } from 'next';

import { AboutContent } from "./components/AboutContent";
import { buildStaticMetadata } from '@/lib/metadata/builders';
import { buildAboutSchema, renderJsonLd } from '@/lib/metadata/schema';

export const metadata: Metadata = buildStaticMetadata('about');

export default function About() {
  return (
    <>
      {renderJsonLd(buildAboutSchema())}
      <AboutContent />
    </>
  );
}
