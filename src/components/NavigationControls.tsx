import { CSSProperties } from 'react';

interface Props {
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

export function NavigationControls({ current, total, onNext, onPrev }: Props) {
  const dotStyle = (i: number): CSSProperties => ({
    width: i === current ? 12 : 8,
    height: i === current ? 12 : 8,
    borderRadius: '50%',
    background: i === current ? '#fff' : 'rgba(255,255,255,0.3)',
    border: i === current ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
  });

  return (
    <>
      {/* Slide dots - right side */}
      <div style={{
        position: 'absolute',
        right: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 20,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={dotStyle(i)} onClick={() => {
            if (i > current) onNext();
            else if (i < current) onPrev();
          }} />
        ))}
      </div>

      {/* Slide counter - bottom right */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.15em',
        zIndex: 20,
      }}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Keyboard hint - bottom center, fades after 5s */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.1em',
        zIndex: 20,
        animation: 'fadeOut 5s forwards',
      }}>
        SCROLL OR ARROW KEYS TO NAVIGATE
      </div>

      <style>{`
        @keyframes fadeOut {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
