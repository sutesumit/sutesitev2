'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Blip } from '@/types/blip';
import BlipCardContent from '@/app/blip/components/BlipCardContent';

type BlipDetailProps = {
  blip: Blip;
  newerBlip?: Blip | null;
  olderBlip?: Blip | null;
};

const BlipDetail = ({ blip, newerBlip, olderBlip }: BlipDetailProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  const goToNewer = useCallback(() => {
    if (newerBlip) {
      setDirection(-1);
      router.push(`/blip/${newerBlip.blip_serial}`);
    }
  }, [newerBlip, router]);

  const goToOlder = useCallback(() => {
    if (olderBlip) {
      setDirection(1);
      router.push(`/blip/${olderBlip.blip_serial}`);
    }
  }, [olderBlip, router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToNewer();
      if (e.key === 'ArrowRight') goToOlder();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToNewer, goToOlder]);

  return (
    <article 
      className="relative max-w-[65ch] overflow-hidden rounded-md border-l-[2px] border-l-blue-500 !border-l-solid shadow-lg font-roboto-mono lowercase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BlipCardContent
        blip={blip}
        newerBlip={newerBlip}
        olderBlip={olderBlip}
        isHovered={isHovered}
        direction={direction}
        showBackButton
        onNewerClick={goToNewer}
        onOlderClick={goToOlder}
      />
    </article>
  );
};

export default BlipDetail;
