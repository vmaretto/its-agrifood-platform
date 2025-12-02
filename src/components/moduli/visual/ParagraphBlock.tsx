'use client';

interface ParagraphBlockProps {
  text: string;
  className?: string;
}

export function ParagraphBlock({ text, className = '' }: ParagraphBlockProps) {
  // Supporta HTML semplice come <strong>, <em>, <br>
  return (
    <div
      className={`text-gray-700 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

export default ParagraphBlock;
