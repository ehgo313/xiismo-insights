import React from "react";

// Renders inline tokens: word[url] -> green link
export const renderInline = (text: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  // Matches (phrase aqui[url]) for multi-word, or word[url] for single word
  const re = /\(([^()\[\]]+)\[([^\]]+)\]\)|([^\s\(\)\[\]]+)\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const url = m[2].match(/^https?:\/\//) ? m[2] : `https://${m[2]}`;
    out.push(
      <a
        key={`l-${i++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 hover:text-green-400 underline underline-offset-2"
      >
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

export const renderArticleBody = (content: string) => {
  const sizes = ["text-4xl", "text-3xl", "text-2xl", "text-xl", "text-lg", "text-base"];
  return content.split("\n").map((line, i) => {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      return (
        <p key={i} className={`${sizes[level - 1]} font-bold text-foreground mt-8 mb-2`}>
          {renderInline(h[2])}
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="whitespace-pre-wrap">{renderInline(line)}</p>;
  });
};
