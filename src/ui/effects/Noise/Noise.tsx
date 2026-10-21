import { useRef, useEffect } from "react";
import "./Noise.css";

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
}: NoiseProps) => {
  const grainRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId: number;
    const canvasSize = 1024;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
    };

    // The noise is generated once, into two frames; each refresh draws one of
    // them at a random wrapped offset. Same grain as regenerating it per
    // refresh, but a GPU blit instead of a million Math.random() calls.
    const makeFrame = () => {
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = canvasSize;
      frameCanvas.height = canvasSize;

      const imageData = new ImageData(canvasSize, canvasSize);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }

      frameCanvas.getContext("2d")?.putImageData(imageData, 0, 0);
      return frameCanvas;
    };

    const frames = [makeFrame(), makeFrame()];

    const drawGrain = () => {
      const source = frames[Math.floor(Math.random() * frames.length)];
      const dx = Math.floor(Math.random() * canvasSize);
      const dy = Math.floor(Math.random() * canvasSize);

      ctx.clearRect(0, 0, canvasSize, canvasSize);
      // four tiles cover the canvas once the frame is shifted by (dx, dy)
      ctx.drawImage(source, -dx, -dy);
      ctx.drawImage(source, canvasSize - dx, -dy);
      ctx.drawImage(source, -dx, canvasSize - dy);
      ctx.drawImage(source, canvasSize - dx, canvasSize - dy);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    // Reduced motion: the grain stays, it just doesn't flicker.
    const isStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onResize = () => {
      resize();
      if (isStill) drawGrain();
    };

    window.addEventListener("resize", onResize);
    resize();
    if (isStill) drawGrain();
    else loop();

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return <canvas className="noise-overlay" ref={grainRef} style={{ imageRendering: "pixelated" }} />;
};

export default Noise;
