import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

interface Props {
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

export function NavigationControls({ current, total, onNext, onPrev }: Props) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);
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
      <div className="nav-dots" style={{
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
      <div className="nav-counter" style={{
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

      {/* Navigation hint - bottom center, device-aware, fades after 5s */}
      {!isTouchDevice && current !== 0 && (
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}>
          SCROLL OR ARROW KEYS TO NAVIGATE
        </div>
      )}

      {/* Download Button - Bottom Left (Desktop Only) */}
      {!isTouchDevice && (
        <a
          href="/pitch/Menius_Pitch_Deck.pdf"
          download="Menius_Pitch_Deck.pdf"
          style={{
            position: 'absolute',
            bottom: 32,
            left: 32,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 16px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          Download PDF
        </a>
      )}

      <style>{`
        @keyframes fadeOut {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (max-width: 768px) {
          .nav-dots {
            right: 16px !important;
          }
          .nav-counter {
            right: 16px !important;
            font-size: 11px !important;
          }
        }
        @media (hover: none) {
          .nav-dots > div {
            min-width: 14px !important;
            min-height: 14px !important;
          }
        }
      `}</style>
    </>
  );
}
