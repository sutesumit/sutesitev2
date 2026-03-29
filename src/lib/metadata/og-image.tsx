import type { ReactElement } from 'react';

import { SITE_NAME, SITE_URL } from '@/config/metadata';

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export function truncateOgText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

type OgCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerLeft?: string;
  footerRight?: string;
  accentColor?: string;
  background?: string;
  textColor?: string;
  mutedColor?: string;
};

export function OgCard({
  eyebrow,
  title,
  description,
  footerLeft = SITE_URL.replace(/^https?:\/\//, ''),
  footerRight = SITE_NAME,
  accentColor = '#2563eb',
  background = 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
  textColor = '#0f172a',
  mutedColor = '#475569',
}: OgCardProps): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background,
        color: textColor,
        padding: '56px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: accentColor,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.08,
          }}
        >
          {truncateOgText(title, 110)}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: mutedColor,
            lineHeight: 1.35,
          }}
        >
          {truncateOgText(description, 180)}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 22,
          color: mutedColor,
        }}
      >
        <div style={{ display: 'flex' }}>{footerLeft}</div>
        <div style={{ display: 'flex' }}>{footerRight}</div>
      </div>
    </div>
  );
}
