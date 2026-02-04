interface IconProps {
  className?: string;
}

export function ArrowLeftIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <rect x="2" y="7" width="2" height="2" />
      <rect x="4" y="5" width="2" height="2" />
      <rect x="4" y="9" width="2" height="2" />
      <rect x="6" y="3" width="2" height="2" />
      <rect x="6" y="11" width="2" height="2" />
      <rect x="6" y="7" width="8" height="2" />
    </svg>
  );
}

export function CopyIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      {/* Back rectangle */}
      <rect x="4" y="2" width="2" height="2" />
      <rect x="6" y="2" width="6" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="4" y="4" width="2" height="6" />
      <rect x="12" y="4" width="2" height="6" />
      <rect x="4" y="10" width="2" height="2" />
      {/* Front rectangle */}
      <rect x="2" y="6" width="2" height="2" />
      <rect x="2" y="8" width="2" height="6" />
      <rect x="4" y="12" width="6" height="2" />
      <rect x="10" y="6" width="2" height="8" />
      <rect x="4" y="6" width="6" height="2" />
    </svg>
  );
}

export function CheckIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <rect x="2" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="6" y="12" width="2" height="2" />
      <rect x="8" y="10" width="2" height="2" />
      <rect x="10" y="8" width="2" height="2" />
      <rect x="12" y="6" width="2" height="2" />
      <rect x="14" y="4" width="2" height="2" />
    </svg>
  );
}

export function DownloadIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      {/* Arrow down */}
      <rect x="7" y="2" width="2" height="6" />
      <rect x="5" y="6" width="2" height="2" />
      <rect x="9" y="6" width="2" height="2" />
      <rect x="3" y="8" width="2" height="2" />
      <rect x="11" y="8" width="2" height="2" />
      {/* Base line */}
      <rect x="2" y="12" width="12" height="2" />
      <rect x="2" y="10" width="2" height="2" />
      <rect x="12" y="10" width="2" height="2" />
    </svg>
  );
}

export function GitHubIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <rect x="4" y="1" width="8" height="2" />
      <rect x="2" y="3" width="2" height="2" />
      <rect x="12" y="3" width="2" height="2" />
      <rect x="2" y="5" width="2" height="4" />
      <rect x="12" y="5" width="2" height="4" />
      <rect x="4" y="5" width="2" height="2" />
      <rect x="10" y="5" width="2" height="2" />
      <rect x="4" y="9" width="2" height="2" />
      <rect x="10" y="9" width="2" height="2" />
      <rect x="6" y="11" width="4" height="2" />
      <rect x="4" y="13" width="2" height="2" />
      <rect x="10" y="13" width="2" height="2" />
    </svg>
  );
}
