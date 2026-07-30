import { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';

interface Props {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}

/** Wraps children in a mouse-responsive 3D tilt (vanilla-tilt.js), with glare. */
export default function TiltCard({ children, className = '', max = 8, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    VanillaTilt.init(el, {
      max,
      speed: 400,
      scale: 1.02,
      glare,
      'max-glare': 0.15,
      gyroscope: true,
      perspective: 900,
    });
    return () => {
      (el as HTMLDivElement & { vanillaTilt?: { destroy: () => void } }).vanillaTilt?.destroy();
    };
  }, [max, glare]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}
