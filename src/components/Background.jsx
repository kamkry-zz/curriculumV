import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 70;
const CONNECTION_DIST = 140;
const COLORS = [
  "rgba(139, 92, 246, 0.4)",
  "rgba(167, 139, 250, 0.3)",
  "rgba(212, 212, 216, 0.25)",
  "rgba(139, 92, 246, 0.15)",
];

const SPARKLE_COLORS = [
  "#FFD700",
  "#00FFFF",
  "#FF00FF",
  "#00FF88",
  "#FF6B35",
  "#FF1493",
  "#7FFF00",
];

const SPARKLE_INTERVAL_MIN = 2500;
const SPARKLE_INTERVAL_MAX = 5000;
const SPARKLE_LIFETIME = 1600;

function drawSparkle(ctx, x, y, r, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const outerX = Math.cos(angle) * r;
    const outerY = Math.sin(angle) * r;
    const innerX = Math.cos(angle + Math.PI / 4) * r * 0.3;
    const innerY = Math.sin(angle + Math.PI / 4) * r * 0.3;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function Background() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let sparkles = [];
    let w, h;
    let lastSparkleTime = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const spawnSparkle = (now) => {
      sparkles.push({
        x: Math.random() * w * 0.9 + w * 0.05,
        y: Math.random() * h * 0.9 + h * 0.05,
        r: Math.random() * 12 + 6,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        born: now,
        rotation: Math.random() * Math.PI * 2,
      });
      lastSparkleTime = now;
    };

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      sparkles = sparkles.filter((s) => timestamp - s.born < SPARKLE_LIFETIME);

      if (timestamp - lastSparkleTime > SPARKLE_INTERVAL_MIN + Math.random() * (SPARKLE_INTERVAL_MAX - SPARKLE_INTERVAL_MIN)) {
        spawnSparkle(timestamp);
      }

      for (const s of sparkles) {
        const age = timestamp - s.born;
        const progress = age / SPARKLE_LIFETIME;
        const fadeIn = 0.2;
        const fadeOut = 0.5;
        let alpha;
        if (progress < fadeIn) {
          alpha = progress / fadeIn;
        } else if (progress > 1 - fadeOut) {
          alpha = (1 - progress) / fadeOut;
        } else {
          alpha = 1;
        }
        const scale = progress < fadeIn ? 0.3 + (progress / fadeIn) * 0.7 : 1;

        ctx.globalAlpha = alpha * 0.85;
        const glowR = s.r * 1.6;
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        glow.addColorStop(0, s.color);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        drawSparkle(ctx, s.x, s.y, s.r * scale, s.rotation + progress * 0.3);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    resize();
    createParticles();

    if (!prefersReduced) {
      animRef.current = requestAnimationFrame(draw);
      window.addEventListener("resize", resize);
    } else {
      animRef.current = requestAnimationFrame(() => {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

export default Background;
