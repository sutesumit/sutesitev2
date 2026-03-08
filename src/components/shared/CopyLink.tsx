'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CopyLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  copyText?: string; // optional override; defaults to full URL built from href
}

export default function CopyLink({ href, className, children, copyText }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    const textToCopy = copyText ?? (href.startsWith('http') ? href : `${window.location.origin}${href}`);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <span className="relative inline-flex items-center gap-1">
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
          Copied!
        </span>
      )}
    </span>
  );
}
