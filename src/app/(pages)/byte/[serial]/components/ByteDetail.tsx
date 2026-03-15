'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Byte } from '@/types/byte';
import ByteCardContent from '@/app/(pages)/byte/components/ByteCardContent';

type ByteDetailProps = {
  byte: Byte;
  newerByte?: Byte | null;
  olderByte?: Byte | null;
};

const ByteDetail = ({ byte, newerByte, olderByte }: ByteDetailProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  const goToNewer = useCallback(() => {
    if (newerByte) {
      setDirection(-1);
      router.push(`/byte/${newerByte.byte_serial}`);
    }
  }, [newerByte, router]);

  const goToOlder = useCallback(() => {
    if (olderByte) {
      setDirection(1);
      router.push(`/byte/${olderByte.byte_serial}`);
    }
  }, [olderByte, router]);

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
      <ByteCardContent
        byte={byte}
        newerByte={newerByte}
        olderByte={olderByte}
        isHovered={isHovered}
        direction={direction}
        showBackButton
        onNewerClick={goToNewer}
        onOlderClick={goToOlder}
      />
    </article>
  );
};

export default ByteDetail;
