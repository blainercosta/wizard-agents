interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const highlightMarkdown = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      if (line.match(/^#{1,6}\s/)) {
        const headerMatch = line.match(/^(#{1,6})\s(.*)$/);
        if (headerMatch) {
          return (
            <div key={index}>
              <span className="text-accent-hover">{headerMatch[1]} </span>
              <span className="text-text-primary font-semibold">{headerMatch[2]}</span>
              {'\n'}
            </div>
          );
        }
      }

      if (line.match(/^\s*[-*]\s/)) {
        const listMatch = line.match(/^(\s*)([-*])(\s.*)$/);
        if (listMatch) {
          return (
            <div key={index}>
              <span>{listMatch[1]}</span>
              <span className="text-accent-hover">{listMatch[2]}</span>
              <span>{processInlineFormatting(listMatch[3])}</span>
              {'\n'}
            </div>
          );
        }
      }

      if (line.match(/^\s*\d+\.\s/)) {
        const numMatch = line.match(/^(\s*)(\d+\.)(\s.*)$/);
        if (numMatch) {
          return (
            <div key={index}>
              <span>{numMatch[1]}</span>
              <span className="text-accent-hover">{numMatch[2]}</span>
              <span>{processInlineFormatting(numMatch[3])}</span>
              {'\n'}
            </div>
          );
        }
      }

      return (
        <div key={index}>
          {processInlineFormatting(line)}
          {'\n'}
        </div>
      );
    });
  };

  const processInlineFormatting = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={keyIndex++}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        parts.push(
          <span key={keyIndex++} className="text-text-primary font-semibold">
            **{boldMatch[1]}**
          </span>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={keyIndex++}>{remaining}</span>);
        break;
      }
    }

    return parts;
  };

  return (
    <div className="text-[13px] leading-relaxed text-text-secondary font-mono whitespace-pre-wrap break-words">
      {highlightMarkdown(content.trim())}
    </div>
  );
}
