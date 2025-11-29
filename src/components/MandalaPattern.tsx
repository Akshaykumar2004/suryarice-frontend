interface MandalaPatternProps {
  opacity?: number;
}

export function MandalaPattern({ opacity = 0.12 }: MandalaPatternProps) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <defs>
        <pattern id="mandala" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 100 + Math.cos(angle) * 15;
            const y1 = 100 + Math.sin(angle) * 15;
            const x2 = 100 + Math.cos(angle) * 60;
            const y2 = 100 + Math.sin(angle) * 60;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            );
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mandala)" />
    </svg>
  );
}
