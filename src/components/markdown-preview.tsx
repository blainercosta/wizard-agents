interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const highlightMarkdown = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      // Headers (# or ##)
      if (line.match(/^#{1,6}\s/)) {
        const headerMatch = line.match(/^(#{1,6})\s(.*)$/);
        if (headerMatch) {
          return (
            <div key={index}>
              <span className="text-accent-lilac">{headerMatch[1]} </span>
              <span className="text-accent-lilac font-bold">{headerMatch[2]}</span>
              {'\n'}
            </div>
          );
        }
      }

      // List items (- or *)
      if (line.match(/^\s*[-*]\s/)) {
        const listMatch = line.match(/^(\s*)([-*])(\s.*)$/);
        if (listMatch) {
          return (
            <div key={index}>
              <span>{listMatch[1]}</span>
              <span className="text-accent-neon">{listMatch[2]}</span>
              <span>{processInlineFormatting(listMatch[3])}</span>
              {'\n'}
            </div>
          );
        }
      }

      // Numbered lists
      if (line.match(/^\s*\d+\.\s/)) {
        const numMatch = line.match(/^(\s*)(\d+\.)(\s.*)$/);
        if (numMatch) {
          return (
            <div key={index}>
              <span>{numMatch[1]}</span>
              <span className="text-accent-neon">{numMatch[2]}</span>
              <span>{processInlineFormatting(numMatch[3])}</span>
              {'\n'}
            </div>
          );
        }
      }

      // Regular line with inline formatting
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

    // Process bold text (**text**)
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before the match
        if (boldMatch.index > 0) {
          parts.push(<span key={keyIndex++}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        // Add bold text
        parts.push(
          <span key={keyIndex++} className="text-text-primary font-bold">
            **{boldMatch[1]}**
          </span>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        // No more bold matches, add remaining text
        parts.push(<span key={keyIndex++}>{remaining}</span>);
        break;
      }
    }

    return parts;
  };

  return (
    <div className="text-sm text-text-secondary font-mono whitespace-pre-wrap break-words">
      {highlightMarkdown(content.trim())}
    </div>
  );
}
