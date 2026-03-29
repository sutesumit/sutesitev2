import { readFile } from 'fs/promises';
import { join } from 'path';
import type { CSSProperties, ReactElement } from 'react';

import { ImageResponse } from 'next/og';

import { SITE_NAME, SITE_URL } from '@/config/metadata';

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

const OG_TOKENS = {
  ink: '#0f172a',
  inkSoft: '#334155',
  muted: '#64748b',
  paper: '#f8fafc',
  paperWarm: '#f1f5f9',
  line: '#cbd5e1',
  blue: '#2563eb',
  blueSoft: '#dbeafe',
  blueDark: '#1e3a8a',
  teal: '#0f766e',
  tealSoft: '#ccfbf1',
  violet: '#6d28d9',
  violetSoft: '#ede9fe',
  night: '#111827',
  nightSoft: '#1f2937',
  amber: '#b45309',
  amberSoft: '#fef3c7',
} as const;

let robotoMonoFontPromise: Promise<ArrayBuffer | null> | null = null;

async function getRobotoMonoFont(): Promise<ArrayBuffer | null> {
  if (!robotoMonoFontPromise) {
    robotoMonoFontPromise = readFile(join(process.cwd(), 'public', 'fonts', 'roboto-mono.ttf'))
      .then((buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
      .catch(() => null);
  }

  return robotoMonoFontPromise;
}

export async function createOgImageResponse(card: ReactElement): Promise<ImageResponse> {
  const robotoMono = await getRobotoMonoFont();

  return new ImageResponse(card, {
    ...OG_IMAGE_SIZE,
    fonts: robotoMono
      ? [
          {
            name: 'Roboto Mono',
            data: robotoMono,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Roboto Mono',
            data: robotoMono,
            weight: 700,
            style: 'normal',
          },
        ]
      : [],
  });
}

export function truncateOgText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

export function formatOgDisplayUrl(pathOrUrl: string): string {
  const fullUrl = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;

  return fullUrl.replace(/^https?:\/\//, '');
}

export function truncateOgDisplayUrl(url: string, maxLength = 44): string {
  return truncateOgText(formatOgDisplayUrl(url), maxLength);
}

type FrameProps = {
  children: ReactElement | ReactElement[];
  background: string;
  color: string;
};

function Frame({ children, background, color }: FrameProps): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background,
        color,
        padding: '28px',
        fontFamily: '"Roboto Mono", "Roboto Mono Fallback", "IBM Plex Mono", "Courier New", monospace',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `2px solid ${OG_TOKENS.line}`,
          padding: '26px 30px',
          background: 'rgba(248, 250, 252, 0.78)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

type HeaderProps = {
  eyebrow: string;
  accent: string;
  indexLabel?: string;
};

function Header({ eyebrow, accent, indexLabel = formatOgDisplayUrl(SITE_URL) }: HeaderProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          fontWeight: 700,
          color: accent,
          textTransform: 'lowercase',
          letterSpacing: '0.08em',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 16,
          color: OG_TOKENS.muted,
          textTransform: 'lowercase',
        }}
      >
        {indexLabel}
      </div>
    </div>
  );
}

type FooterProps = {
  left: string;
  right: string;
  color?: string;
  leftMaxLength?: number;
};

function Footer({
  left,
  right,
  color = OG_TOKENS.muted,
  leftMaxLength = 44,
}: FooterProps): ReactElement {
  const displayLeft = truncateOgDisplayUrl(left, leftMaxLength);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 18,
        color,
        textTransform: 'lowercase',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
        }}
      >
        {displayLeft}
      </div>
      <div
        style={{
          display: 'flex',
          maxWidth: '260px',
          textAlign: 'right',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
      >
        {truncateOgText(right, 28)}
      </div>
    </div>
  );
}

type SharedOgProps = {
  title: string;
  description: string;
  footerLeft?: string;
  footerRight?: string;
};

const TITLE_STYLE: CSSProperties = {
  display: 'flex',
  fontSize: 58,
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
};

const DESCRIPTION_STYLE: CSSProperties = {
  display: 'flex',
  fontSize: 24,
  lineHeight: 1.38,
};

export function HomeOgCard({
  title,
  description,
  footerLeft = '/',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paper} 0%, ${OG_TOKENS.blueSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="sumit sute" accent={OG_TOKENS.blueDark} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={TITLE_STYLE}>{truncateOgText(title, 96)}</div>
        <div style={{ ...DESCRIPTION_STYLE, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 190)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.blueDark} />
    </Frame>
  );
}

export function AboutOgCard({
  title,
  description,
  footerLeft = '/about',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paperWarm} 0%, ${OG_TOKENS.amberSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="about" accent={OG_TOKENS.amber} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ ...TITLE_STYLE, fontSize: 54 }}>{truncateOgText(title, 90)}</div>
        <div style={{ ...DESCRIPTION_STYLE, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 210)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.amber} />
    </Frame>
  );
}

export function WorkIndexOgCard({
  title,
  description,
  footerLeft = '/work',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paperWarm} 0%, ${OG_TOKENS.amberSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="work" accent={OG_TOKENS.amber} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ ...TITLE_STYLE, fontSize: 54 }}>{truncateOgText(title, 102)}</div>
        <div style={{ ...DESCRIPTION_STYLE, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 180)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.amber} />
    </Frame>
  );
}

export function BloqIndexOgCard({
  title,
  description,
  footerLeft = '/bloq',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paper} 0%, ${OG_TOKENS.blueSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="bloq" accent={OG_TOKENS.blue} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={TITLE_STYLE}>{truncateOgText(title, 110)}</div>
        <div style={{ ...DESCRIPTION_STYLE, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 210)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} />
    </Frame>
  );
}

export function ByteIndexOgCard({
  title,
  description,
  footerLeft = '/byte',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paperWarm} 0%, ${OG_TOKENS.tealSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="byte" accent={OG_TOKENS.teal} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '900px' }}>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 700, color: OG_TOKENS.teal }}>
          {truncateOgText(title, 90)}
        </div>
        <div style={{ ...DESCRIPTION_STYLE, fontSize: 30, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 240)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.teal} />
    </Frame>
  );
}

export function BlipIndexOgCard({
  title,
  description,
  footerLeft = '/blip',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paper} 0%, ${OG_TOKENS.violetSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="blip" accent={OG_TOKENS.violet} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: OG_TOKENS.violet }}>
          {truncateOgText(title, 80)}
        </div>
        <div style={{ ...DESCRIPTION_STYLE, color: '#4c1d95' }}>
          {truncateOgText(description, 220)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.violet} />
    </Frame>
  );
}

export function ArticleOgCard({
  title,
  description,
  footerLeft = '/bloq',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paper} 0%, ${OG_TOKENS.blueSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="bloq" accent={OG_TOKENS.blue} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={TITLE_STYLE}>{truncateOgText(title, 110)}</div>
        <div style={{ ...DESCRIPTION_STYLE, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 210)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} />
    </Frame>
  );
}

export function ProjectOgCard({
  title,
  description,
  footerLeft = '/work',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paperWarm} 0%, ${OG_TOKENS.amberSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="work" accent={OG_TOKENS.amber} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ ...TITLE_STYLE, fontSize: 54 }}>{truncateOgText(title, 110)}</div>
        <div style={{ ...DESCRIPTION_STYLE, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 180)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.amber} />
    </Frame>
  );
}

export function ByteOgCard({
  title,
  description,
  footerLeft = '/byte',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paperWarm} 0%, ${OG_TOKENS.tealSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="byte" accent={OG_TOKENS.teal} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '900px' }}>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 700, color: OG_TOKENS.teal }}>
          {truncateOgText(title, 90)}
        </div>
        <div style={{ ...DESCRIPTION_STYLE, fontSize: 30, color: OG_TOKENS.inkSoft }}>
          {truncateOgText(description, 260)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.teal} />
    </Frame>
  );
}

export function BlipOgCard({
  title,
  description,
  footerLeft = '/blip',
  footerRight = SITE_NAME,
}: SharedOgProps): ReactElement {
  return (
    <Frame background={`linear-gradient(135deg, ${OG_TOKENS.paper} 0%, ${OG_TOKENS.violetSoft} 100%)`} color={OG_TOKENS.ink}>
      <Header eyebrow="blip" accent={OG_TOKENS.violet} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: OG_TOKENS.violet }}>
          {truncateOgText(title, 80)}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            color: OG_TOKENS.muted,
            textTransform: 'lowercase',
            letterSpacing: '0.08em',
          }}
        >
          definition
        </div>
        <div style={{ ...DESCRIPTION_STYLE, color: '#4c1d95' }}>
          {truncateOgText(description, 220)}
        </div>
      </div>
      <Footer left={footerLeft} right={footerRight} color={OG_TOKENS.violet} />
    </Frame>
  );
}
