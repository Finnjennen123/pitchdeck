import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useSpring } from '@react-spring/three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useSlideNavigation } from './hooks/useSlideNavigation';
import { TextOverlay } from './components/TextOverlay';
import { NavigationControls } from './components/NavigationControls';
import { CitySegment } from './segments/CitySegment';

import { EarthSegment } from './segments/EarthSegment';
import { SolarSegment } from './segments/SolarSegment';
import { GalaxySegment } from './segments/GalaxySegment';
import { UniverseSegment } from './segments/UniverseSegment';

// Preload Earth textures during intro animation so they're cached when EarthSegment mounts
useLoader.preload(TextureLoader, [
  'textures/earth_day_4k.jpg',
  'textures/earth_night_4k.jpg',
  'textures/earth_clouds_2k.jpg',
]);

const TOTAL_SLIDES = 11;

// Map slide -> segment index
// 0: City+Aerial, 2: Earth, 3: Solar, 4: Galaxy, 5: Universe
const SLIDE_TO_SEGMENT = [0, 0, 2, 2, 2, 2, 3, 3, 4, 4, 5];

const EARTH_RADIUS = 10;

// SF position on Earth sphere
const SF_PHI = (90 - 37.78) * (Math.PI / 180);
const SF_THETA = (-122.42 + 180) * (Math.PI / 180);
const SF_DIR = new THREE.Vector3(
  -Math.sin(SF_PHI) * Math.cos(SF_THETA),
  Math.cos(SF_PHI),
  Math.sin(SF_PHI) * Math.sin(SF_THETA)
).normalize();

type CamState = [number, number, number, number, number, number, number];

function getCameraState(slide: number): CamState {
  switch (slide) {
    case 0: // Slide 1: Cover - Golden Gate
      return [-30, 4.5, -24, 0, 2, 0, 52];
    case 1: // Slide 2: Founders - Aerial SF
      return [-8, 20, 8, -2, 0, -2, 52];
    case 2: { // Slide 3: Problem - California
      const p = SF_DIR.clone().multiplyScalar(EARTH_RADIUS + 5);
      return [p.x, p.y, p.z, 0, 0, 0, 42];
    }
    case 3: { // Slide 4: Insight - USA
      const p = SF_DIR.clone().multiplyScalar(EARTH_RADIUS + 9);
      return [p.x, p.y, p.z, 0, 0, 0, 50];
    }
    case 4: // Slide 5: Solution - Full Earth
      return [-8, 5, EARTH_RADIUS + 18, 0, 0, 0, 50];
    case 5: // Slide 6: Solution - Video
      return [-8, 5, EARTH_RADIUS + 18, 0, 0, 0, 50];
    case 6: // Slide 7 (State 1): Strategy - Funnel
    case 7: // Slide 7 (State 2): Strategy - Two Signals
      return [6, 2, 9, 4, 0, 3, 48];
    case 8: // Slide 8: Traction - Galaxy
      return [8, 35, 60, 0, 0, 0, 58];
    case 9: // Slide 9: Business - Clusters
      return [40, 60, 160, 0, 0, 0, 60];
    case 10: // Slide 10: Thank You - Universe
      return [80, 120, 380, 0, 0, 0, 62];
    default:
      return [0, 0, 10, 0, 0, 0, 60];
  }
}

// Orbital camera for Solar slide — cinematic sun-on-the-side composition
const ORBIT_RADIUS = 11;
const ORBIT_SPEED = 0.1;
const ORBIT_HEIGHT = 2;
const ORBIT_SETTLE = 2.0; // seconds to ease into orbit
const ORBIT_START_ANGLE = Math.atan2(9, 6); // matches getCameraState(6) position

function CameraController({ currentSlide }: { currentSlide: number }) {
  const camState = getCameraState(currentSlide);
  const orbitTimeRef = useRef(0);
  const prevSlideRef = useRef(currentSlide);

  // Detect segment changes — jump camera instantly (fade hides it)
  const currentSegment = SLIDE_TO_SEGMENT[currentSlide];
  const prevSegmentRef = useRef(currentSegment);
  const segmentChanged = currentSegment !== prevSegmentRef.current;
  const wasGalaxy = prevSegmentRef.current === 4;
  prevSegmentRef.current = currentSegment;

  const { pos, target, fov } = useSpring({
    pos: [camState[0], camState[1], camState[2]] as [number, number, number],
    target: [camState[3], camState[4], camState[5]] as [number, number, number],
    fov: camState[6],
    config: { mass: 2, tension: 20, friction: 24 },
    immediate: segmentChanged && !(currentSegment === 5 && wasGalaxy),
  });

  useFrame(({ camera }, delta) => {
    const p = pos.get();
    const t = target.get();
    const f = fov.get();

    // Reset orbit timer when entering slide 6 or 7 (Solar) from outside
    const isSolar = currentSlide >= 6 && currentSlide <= 7;
    const wasSolar = prevSlideRef.current >= 6 && prevSlideRef.current <= 7;
    
    if (isSolar && !wasSolar) {
      orbitTimeRef.current = 0;
    }
    prevSlideRef.current = currentSlide;

    // Orbit logic for Solar slide (Strategy)
    if (isSolar) {
      orbitTimeRef.current += delta;

      // Smoothstep easing — buttery transition from static to orbital
      const raw = Math.min(1, orbitTimeRef.current / ORBIT_SETTLE);
      const blend = raw * raw * (3 - 2 * raw);

      // Orbit angle starts exactly where the spring camera lands
      const angle = ORBIT_START_ANGLE + orbitTimeRef.current * ORBIT_SPEED;

      // Camera orbits around the Sun
      const ox = Math.cos(angle) * ORBIT_RADIUS;
      const oz = Math.sin(angle) * ORBIT_RADIUS;

      camera.position.set(
        p[0] + (ox - p[0]) * blend,
        p[1] + (ORBIT_HEIGHT - p[1]) * blend,
        p[2] + (oz - p[2]) * blend
      );

      // Look target orbits 90° ahead at small radius — keeps sun off to the side
      const lookAngle = angle + Math.PI * 0.5;
      const lookR = 3;
      camera.lookAt(
        t[0] + (Math.cos(lookAngle) * lookR - t[0]) * blend,
        t[1] + (0.5 - t[1]) * blend,
        t[2] + (Math.sin(lookAngle) * lookR - t[2]) * blend
      );
    } else {
      camera.position.set(p[0], p[1], p[2]);
      camera.lookAt(t[0], t[1], t[2]);
    }

    (camera as THREE.PerspectiveCamera).fov = f;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}

function SharedPostProcessing({ segment }: { segment: number }) {
  const isDeepSpace = segment >= 4;
  const isSolar = segment === 3;

  return (
    <EffectComposer>
      <Bloom
        intensity={isDeepSpace ? 2.5 : isSolar ? 2.0 : 1.2}
        luminanceThreshold={isDeepSpace ? 0.3 : 0.5}
        luminanceSmoothing={0.9}
        radius={isDeepSpace ? 1.0 : 0.8}
        mipmapBlur
      />
      <Vignette
        darkness={isDeepSpace ? 0.65 : 0.45}
        offset={0.3}
      />
    </EffectComposer>
  );
}

function FogController({ segment, currentSlide }: { segment: number; currentSlide: number }) {
  const { scene } = useThree();

  useEffect(() => {
    if (segment === 0) {
      if (currentSlide === 0) {
        scene.fog = new THREE.Fog('#040410', 20, 65);
      } else {
        // Aerial view: push fog out so city is visible from altitude
        scene.fog = new THREE.Fog('#040410', 35, 120);
      }
    } else {
      scene.fog = null;
    }
  }, [segment, currentSlide, scene]);

  return null;
}

// Determine which segments to mount: current + adjacent at segment boundaries
function getSegmentsToMount(currentSlide: number): Set<number> {
  const currentSeg = SLIDE_TO_SEGMENT[currentSlide];
  const segments = new Set([currentSeg]);

  // Pre-mount next segment when on a boundary slide
  if (currentSlide < TOTAL_SLIDES - 1) {
    const nextSeg = SLIDE_TO_SEGMENT[currentSlide + 1];
    if (nextSeg !== currentSeg) segments.add(nextSeg);
  }
  // Pre-mount previous segment when on a boundary slide
  if (currentSlide > 0) {
    const prevSeg = SLIDE_TO_SEGMENT[currentSlide - 1];
    if (prevSeg !== currentSeg) segments.add(prevSeg);
  }

  return segments;
}

function SceneContent({ currentSlide }: { currentSlide: number }) {
  const currentSegment = SLIDE_TO_SEGMENT[currentSlide];
  const mounted = useMemo(() => getSegmentsToMount(currentSlide), [currentSlide]);

  return (
    <>
      <CameraController currentSlide={currentSlide} />
      <FogController segment={currentSegment} currentSlide={currentSlide} />

      {mounted.has(0) && <CitySegment currentSlide={currentSlide} visible={currentSegment === 0} />}
      {mounted.has(2) && <EarthSegment currentSlide={currentSlide} visible={currentSegment === 2} />}
      {mounted.has(3) && <SolarSegment currentSlide={currentSlide} visible={currentSegment === 3} />}
      {mounted.has(4) && <GalaxySegment currentSlide={currentSlide} visible={currentSegment === 4} />}
      {mounted.has(5) && <UniverseSegment currentSlide={currentSlide} visible={currentSegment === 5} />}

      <SharedPostProcessing segment={currentSegment} />
    </>
  );
}

// Intro animation phases
type IntroPhase = 'init' | 'typingTitle' | 'typingSubtitle' | 'footer' | 'fadeout' | 'done';

function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<IntroPhase>('init');
  const [titleText, setTitleText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  
  const FULL_TITLE = "Menius";
  const FULL_SUBTITLE = "Closing the gap between what AI can do and how it's used.";
  const FOOTER_TEXT = "Finn Jennen & Lucas Fedronic — menius.space";

  // Use refs for animation state to avoid re-renders just for logic
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;

      if (phase === 'init') {
        if (elapsed > 800) {
          setPhase('typingTitle');
          startTimeRef.current = null;
        }
      } else if (phase === 'typingTitle') {
        // Type 1 char every 100ms
        const charIndex = Math.floor(elapsed / 100);
        if (charIndex <= FULL_TITLE.length) {
          setTitleText(FULL_TITLE.slice(0, charIndex));
        } else {
          // Pause 600ms
          if (elapsed > (FULL_TITLE.length * 100 + 600)) {
            setPhase('typingSubtitle');
            startTimeRef.current = null;
          }
        }
      } else if (phase === 'typingSubtitle') {
        // Type 1 char every 30ms
        const charIndex = Math.floor(elapsed / 30);
        if (charIndex <= FULL_SUBTITLE.length) {
          setSubtitleText(FULL_SUBTITLE.slice(0, charIndex));
        } else {
          // Pause 800ms
          if (elapsed > (FULL_SUBTITLE.length * 30 + 800)) {
            setPhase('footer');
            startTimeRef.current = null;
          }
        }
      } else if (phase === 'footer') {
        if (elapsed > 2500) {
          setPhase('fadeout');
          startTimeRef.current = null;
        }
      } else if (phase === 'fadeout') {
        if (elapsed > 1000) {
          setPhase('done');
          onComplete();
        }
      }
      
      if (phase !== 'done') {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [phase, onComplete]);

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#000',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 80px',
      opacity: phase === 'fadeout' ? 0 : 1,
      transition: 'opacity 1s ease-in-out',
    }}>
      {/* Title Container */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <h1 style={{
           fontFamily: "'Playfair Display', serif",
           fontSize: 160,
           fontWeight: 600,
           letterSpacing: '-0.02em',
           lineHeight: 1.1,
           fontStyle: 'italic',
           opacity: 0, // Ghost
           margin: 0,
           pointerEvents: 'none',
        }}>
          {FULL_TITLE}
        </h1>
        <h1 style={{
           fontFamily: "'Playfair Display', serif",
           fontSize: 160,
           fontWeight: 600,
           color: '#ffffff',
           letterSpacing: '-0.02em',
           lineHeight: 1.1,
           fontStyle: 'italic',
           textShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.8)',
           position: 'absolute',
           top: 0,
           left: 0,
           width: '100%',
           textAlign: 'center',
           margin: 0,
        }}>
          {titleText}
        </h1>
      </div>

      {/* Subtitle Container */}
      <div style={{ position: 'relative', maxWidth: 800, width: '100%' }}>
        <p style={{
           fontFamily: "'Plus Jakarta Sans', sans-serif",
           fontSize: 32,
           fontWeight: 500,
           textAlign: 'center',
           lineHeight: 1.4,
           whiteSpace: 'pre-line',
           opacity: 0, // Ghost
           margin: 0,
           pointerEvents: 'none',
        }}>
          {FULL_SUBTITLE}
        </p>
        <p style={{
           fontFamily: "'Plus Jakarta Sans', sans-serif",
           fontSize: 32,
           fontWeight: 500,
           color: 'rgba(255,255,255,0.9)',
           textAlign: 'center',
           lineHeight: 1.4,
           textShadow: '0 0 40px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)',
           whiteSpace: 'pre-line',
           position: 'absolute',
           top: 0,
           left: 0,
           width: '100%',
           margin: 0,
        }}>
          {subtitleText}
        </p>
      </div>
      
      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        opacity: phase === 'footer' || phase === 'fadeout' ? 0.7 : 0,
        transition: 'opacity 1.5s ease-out',
      }}>
         <p style={{ 
           fontFamily: "'Inter', sans-serif",
           fontSize: 16, 
           color: 'rgba(255,255,255,0.6)', 
           whiteSpace: 'pre-line' 
         }}>
           {FOOTER_TEXT}
         </p>
      </div>
    </div>
  );
}

export function CosmicZoomDeck() {
  const { currentSlide, next, prev, transitionState, transitionData } = useSlideNavigation(TOTAL_SLIDES);
  const currentSegment = SLIDE_TO_SEGMENT[currentSlide];
  const prevSegmentRef = useRef(currentSegment);
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  // Fade overlay when scene segment changes
  const [fadeOpacity, setFadeOpacity] = useState(0);

  useEffect(() => {
    if (currentSegment !== prevSegmentRef.current && !(currentSegment === 5 && prevSegmentRef.current === 4)) {
      setFadeOpacity(1);
      const timer = setTimeout(() => setFadeOpacity(0), 500);
      prevSegmentRef.current = currentSegment;
      return () => clearTimeout(timer);
    }
  }, [currentSegment]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#000',
      overflow: 'hidden',
    }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        camera={{ fov: 65, near: 0.01, far: 10000 }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <SceneContent currentSlide={currentSlide} />
        </Suspense>
      </Canvas>

      {/* Intro animation */}
      {!introComplete && <IntroOverlay onComplete={handleIntroComplete} />}

      {/* Fade overlay for cross-segment transitions */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#000',
        opacity: fadeOpacity,
        transition: 'opacity 0.4s ease-in-out',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {introComplete && <TextOverlay currentSlide={currentSlide} transitionState={transitionState} transitionData={transitionData} />}

      {introComplete && (
        <NavigationControls
          current={currentSlide}
          total={TOTAL_SLIDES}
          onNext={next}
          onPrev={prev}
        />
      )}
    </div>
  );
}
