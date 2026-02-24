import React from 'react';
import Link from 'next/link';
import { CodeBlock } from '@/components/ui/code-block';
import { cn } from '@/lib/utils';

const MDXComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-bold mt-6 mb-4 text-blue-900 dark:text-blue-400" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-semibold mt-4 mb-3 text-blue-800 dark:text-blue-300" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-medium mt-4 mb-2 text-blue-700 dark:text-blue-200" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed opacity-90" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside mb-4 ml-6 space-y-1 opacity-90" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside mb-4 ml-6 space-y-1 opacity-90" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 opacity-80" {...props} />
  ),
  del: (props: React.HTMLAttributes<HTMLElement>) => (
    <del className="line-through opacity-60" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const href = props.href || '';
    if (href.startsWith('/')) {
      return (
        <Link href={href} className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>
          {props.children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
        {...props}
      />
    );
  },
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    // Inline code (no className means it's inline)
    if (!props.className) {
      return <code className="bg-slate-200 dark:bg-slate-800 rounded px-1 py-1 text-sm font-mono" {...props} />;
    }
    // Code block - extract language from className
    const match = /language-(\w+)/.exec(props.className || '');
    const language = match ? match[1] : 'text';
    const code = String(props.children).replace(/\n$/, '');
    
    return (
      <CodeBlock
        language={language}
        filename={`code.${language}`}
        code={code}
      />
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    // Just return children since CodeBlock handles the wrapper
    return <>{props.children}</>;
  },
  table: ({ children, className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className={cn("min-w-full border-collapse border border-gray-300 dark:border-gray-700", className)} {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("bg-gray-50 dark:bg-gray-800", className)} {...props} />
  ),
  tbody: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={cn("bg-white dark:bg-gray-900", className)} {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn("border-b border-gray-200 dark:border-gray-700", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0", className)} {...props} />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0", className)} {...props} />
  ),
  iframe: (props: React.IframeHTMLAttributes<HTMLIFrameElement>) => (
    <iframe
      width="100%"
      height="500"
      {...props}
      style={{
        display: 'block',
        width: '100%',
        height: 500,
        border: 'none',
        borderRadius: 4,
        overflow: 'hidden',
        ...((props.style as React.CSSProperties) || {}),
      }}
    />
  ),
};

export default MDXComponents;
