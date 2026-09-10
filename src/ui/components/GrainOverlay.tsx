import grainGif from '../assets/grain-slow.gif';

export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 mix-blend-multiply opacity-10"
      style={{
        backgroundImage: `url(${grainGif})`,
        backgroundSize: '480px 360px',
        backgroundPosition: 'top left',
        backgroundRepeat: 'repeat',
      }}
    />
  );
}
