import React from 'react';

export function renderContent(text: string): React.ReactNode[] {
  const parts = text.split(/(!\[[^\]]*\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (m) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={m[2]}
          alt={m[1]}
          className="max-w-full rounded-lg my-2 block"
        />
      );
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
  });
}

export default function ContentPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <span className="text-gray-400 italic text-sm">미리보기가 여기에 표시됩니다.</span>;
  }
  return <div className="text-sm leading-7 text-gray-700">{renderContent(content)}</div>;
}
