import confetti from 'canvas-confetti';

export function burstConfettiCenter() {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    colors: ['#ff6b9d', '#ffb3c6', '#ffd166', '#a8f3d1', '#c77dff', '#70d6ff']
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function fireSideCannons() {
  const end = Date.now() + 1.2 * 1000;
  const colors = ['#f472b6', '#fb7185', '#38bdf8', '#fbbf24', '#c084fc', '#4ade80'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function popBalloonConfetti(x: number, y: number) {
  // Convert screen coordinates to canvas-confetti normalized origin (0 to 1)
  const normX = Math.max(0.1, Math.min(0.9, x / window.innerWidth));
  const normY = Math.max(0.1, Math.min(0.9, y / window.innerHeight));

  confetti({
    particleCount: 35,
    spread: 70,
    startVelocity: 30,
    origin: { x: normX, y: normY },
    colors: ['#ff85a2', '#ffd166', '#80ed99', '#a2d2ff', '#f15bb5'],
    ticks: 120,
    gravity: 0.9,
    scalar: 0.9
  });
}
