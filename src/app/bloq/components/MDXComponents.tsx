import React from 'react';
import Link from 'next/link';

const MDXComponents = {
  h1: (props: any) => (
    <h1 className="font-bold mt-6 mb-4 text-blue-900 dark:text-blue-400" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="font-semibold mt-4 mb-3 text-blue-800 dark:text-blue-300" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="font-medium mt-4 mb-2 text-blue-700 dark:text-blue-200" {...props} />
  ),
  p: (props: any) => (
    <p className="mb-4 leading-relaxed opacity-90" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc list-inside mb-4 ml-4 space-y-1 opacity-90" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-inside mb-4 ml-4 space-y-1 opacity-90" {...props} />
  ),
  li: (props: any) => (
    <li className="" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 opacity-80" {...props} />
  ),
  a: (props: any) => {
    const href = props.href;
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
  code: (props: any) => (
    <code className="bg-slate-200 dark:bg-slate-800 rounded px-1 py-0.5 text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-slate-200 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono" {...props} />
  ),
};

export default MDXComponents;
