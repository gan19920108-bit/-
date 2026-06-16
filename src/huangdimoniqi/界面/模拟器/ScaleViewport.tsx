import React from 'react';

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

export default function ScaleViewport({ children }: { children: React.ReactNode }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      setScale(width / DESIGN_WIDTH);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scaledHeight = DESIGN_HEIGHT * scale;

  return (
    <div
      ref={wrapperRef}
      className="huangdi-scale-wrapper"
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        height: scaledHeight,
      }}
    >
      <div
        className="huangdi-scale-canvas"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: '50%',
          marginLeft: -(DESIGN_WIDTH / 2),
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
