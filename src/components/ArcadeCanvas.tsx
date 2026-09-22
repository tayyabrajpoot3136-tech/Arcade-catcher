import React, { useEffect, useRef, useCallback } from 'react';
import type {
  FallingItem,
  ItemType,
  Particle,
  FloatingText,
  StarBackground,
  GameStatus,
  GameStats,
} from '../types';
import { sounds } from '../utils/audio';

interface ArcadeCanvasProps {
  status: GameStatus;
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  onGameOver: () => void;
  touchMoveLeft: boolean;
  touchMoveRight: boolean;
}

export const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({
  status,
  stats,
  onUpdateStats,
  onGameOver,
  touchMoveLeft,
  touchMoveRight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable game simulation refs (avoiding React state re-render loop inside requestAnimationFrame)
  const stateRef = useRef<{
    width: number;
    height: number;
    paddleX: number;
    paddleTargetX: number;
    paddleWidth: number;
    paddleHeight: number;
    keys: { left: boolean; right: boolean };
    items: FallingItem[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    stars: StarBackground[];
    lastSpawnTime: number;
    nextItemId: number;
    nextParticleId: number;
    nextTextId: number;
    screenShake: number; // intensity
    slowMoRemaining: number;
    combo: number;
    maxCombo: number;
    lives: number;
    score: number;
    itemsCaught: number;
    bombsHit: number;
    highScore: number;
  }>({
    width: 600,
    height: 800,
    paddleX: 300,
    paddleTargetX: 300,
    paddleWidth: 100,
    paddleHeight: 18,
    keys: { left: false, right: false },
    items: [],
    particles: [],
    floatingTexts: [],
    stars: [],
    lastSpawnTime: 0,
    nextItemId: 1,
    nextParticleId: 1,
    nextTextId: 1,
    screenShake: 0,
    slowMoRemaining: 0,
    combo: 1,
    maxCombo: 1,
    lives: 3,
    score: 0,
    itemsCaught: 0,
    bombsHit: 0,
    highScore: 0,
  });

  // Sync incoming props into ref
  useEffect(() => {
    stateRef.current.lives = stats.lives;
    stateRef.current.score = stats.score;
    stateRef.current.combo = stats.combo;
    stateRef.current.highScore = stats.highScore;
  }, [stats.lives, stats.score, stats.combo, stats.highScore]);

  // Sync touch controls
  useEffect(() => {
    stateRef.current.keys.left = touchMoveLeft;
  }, [touchMoveLeft]);

  useEffect(() => {
    stateRef.current.keys.right = touchMoveRight;
  }, [touchMoveRight]);

  // Generate background stars
  const initStars = useCallback((width: number, height: number) => {
    const starCount = Math.floor((width * height) / 8000);
    const stars: StarBackground[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 30 + 15,
        opacity: Math.random() * 0.7 + 0.2,
      });
    }
    stateRef.current.stars = stars;
  }, []);

  // ResizeObserver to adapt to container resizing dynamically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.resetTransform?.();
          ctx.scale(dpr, dpr);
        }
      }

      stateRef.current.width = width;
      stateRef.current.height = height;
      stateRef.current.paddleWidth = Math.max(80, Math.min(110, width * 0.22));

      // Keep paddle in bounds
      stateRef.current.paddleX = Math.min(
        Math.max(stateRef.current.paddleWidth / 2, stateRef.current.paddleX),
        width - stateRef.current.paddleWidth / 2
      );
      stateRef.current.paddleTargetX = stateRef.current.paddleX;

      if (stateRef.current.stars.length === 0) {
        initStars(width, height);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => observer.disconnect();
  }, [initStars]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer / Mouse controls
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    stateRef.current.paddleTargetX = x;
  };

  // Particle emission helper
  const emitParticles = (x: number, y: number, color: string, count: number = 12) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 140 + 40;
      s.particles.push({
        id: s.nextParticleId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: Math.random() * 0.3 + 0.3,
      });
    }
  };

  // Add floating text
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const s = stateRef.current;
    s.floatingTexts.push({
      id: s.nextTextId++,
      text,
      x,
      y,
      color,
      opacity: 1,
      scale: 1.2,
      vy: -60,
    });
  };

  // Main game animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = stateRef.current;
      const { width, height } = s;

      // Handle screen shake
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (s.screenShake > 0) {
        shakeOffsetX = (Math.random() - 0.5) * s.screenShake * 12;
        shakeOffsetY = (Math.random() - 0.5) * s.screenShake * 12;
        s.screenShake = Math.max(0, s.screenShake - dt * 4);
      }

      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // Clear with deep space canvas
      ctx.fillStyle = '#060814';
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Draw background grid lines with subtle opacity
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Stars
      for (let i = 0; i < s.stars.length; i++) {
        const star = s.stars[i];
        if (status === 'playing') {
          star.y += star.speed * dt * (s.slowMoRemaining > 0 ? 0.4 : 1);
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // UPDATE LOGIC (only when playing)
      if (status === 'playing') {
        // Slow-mo timer decrement
        if (s.slowMoRemaining > 0) {
          s.slowMoRemaining = Math.max(0, s.slowMoRemaining - dt * 1000);
          if (s.slowMoRemaining === 0) {
            onUpdateStats((prev) => ({ ...prev, slowMoActive: false, slowMoRemaining: 0 }));
          }
        }

        // Paddle movement with keys or target smoothing
        const paddleSpeed = 650;
        if (s.keys.left) {
          s.paddleX -= paddleSpeed * dt;
          s.paddleTargetX = s.paddleX;
        } else if (s.keys.right) {
          s.paddleX += paddleSpeed * dt;
          s.paddleTargetX = s.paddleX;
        } else {
          // Smooth glide toward target pointer
          s.paddleX += (s.paddleTargetX - s.paddleX) * Math.min(dt * 18, 1);
        }

        // Clamp paddle to screen bounds
        const halfW = s.paddleWidth / 2;
        s.paddleX = Math.max(halfW, Math.min(width - halfW, s.paddleX));

        // Spawning items
        const timeSinceSpawn = currentTime - s.lastSpawnTime;
        // Spawn rate scales with score: from 900ms down to 450ms
        const spawnInterval = Math.max(450, 950 - (s.score / 100) * 40);

        if (timeSinceSpawn > spawnInterval) {
          s.lastSpawnTime = currentTime;

          // Pick item type based on probabilities
          const rand = Math.random();
          let type: ItemType = 'star';
          let points = 10;
          let radius = 14;

          if (rand < 0.50) {
            type = 'star';
            points = 10;
            radius = 13;
          } else if (rand < 0.75) {
            type = 'crystal';
            points = 25;
            radius = 15;
          } else if (rand < 0.85) {
            type = 'bomb';
            points = 0;
            radius = 16;
          } else if (rand < 0.93) {
            type = 'gem';
            points = 50;
            radius = 17;
          } else if (rand < 0.97 && s.lives < 3) {
            type = 'heart';
            points = 0;
            radius = 15;
          } else {
            type = 'clock';
            points = 15;
            radius = 15;
          }

          // Speed formula scales with score
          const baseSpeed = 190 + Math.min(s.score * 0.35, 320);
          const itemSpeed = baseSpeed * (Math.random() * 0.3 + 0.85);

          s.items.push({
            id: s.nextItemId++,
            type,
            x: Math.random() * (width - 60) + 30,
            y: -25,
            radius,
            speed: itemSpeed,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
            wobbleOffset: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 2 + 1.5,
            points,
          });
        }

        // Update items
        const paddleY = height - 50;
        const timeScale = s.slowMoRemaining > 0 ? 0.42 : 1;

        for (let i = s.items.length - 1; i >= 0; i--) {
          const item = s.items[i];
          item.y += item.speed * dt * timeScale;
          item.rotation += item.rotationSpeed * dt * timeScale;
          item.x += Math.sin(currentTime * 0.003 * item.wobbleSpeed + item.wobbleOffset) * 0.8;

          // Check paddle collision
          // Paddle top bounds
          const paddleTop = paddleY - s.paddleHeight / 2;
          const paddleBottom = paddleY + s.paddleHeight / 2;
          const paddleLeft = s.paddleX - s.paddleWidth / 2;
          const paddleRight = s.paddleX + s.paddleWidth / 2;

          const collided =
            item.y + item.radius >= paddleTop &&
            item.y - item.radius <= paddleBottom &&
            item.x + item.radius >= paddleLeft &&
            item.x - item.radius <= paddleRight;

          if (collided) {
            // Collected!
            s.items.splice(i, 1);

            if (item.type === 'bomb') {
              // Hit bomb!
              s.screenShake = 1.0;
              s.lives = Math.max(0, s.lives - 1);
              s.combo = 1;
              s.bombsHit++;
              sounds.playBomb();
              emitParticles(item.x, item.y, '#ef4444', 24);
              addFloatingText('-1 LIFE!', item.x, item.y - 15, '#ef4444');

              onUpdateStats((prev) => {
                const nextLives = Math.max(0, prev.lives - 1);
                return {
                  ...prev,
                  lives: nextLives,
                  combo: 1,
                  bombsHit: prev.bombsHit + 1,
                };
              });

              if (s.lives <= 0) {
                sounds.playGameOver();
                onGameOver();
                break;
              }
            } else {
              // Good item collected
              s.itemsCaught++;
              const earnedPoints = item.points * s.combo;
              s.score += earnedPoints;

              if (s.score > s.highScore) {
                s.highScore = s.score;
                localStorage.setItem('arcade_catcher_high', String(s.highScore));
              }

              // Update combo
              s.combo++;
              if (s.combo > s.maxCombo) {
                s.maxCombo = s.combo;
              }

              // Item-specific effects
              if (item.type === 'star') {
                sounds.playCatch(s.combo);
                emitParticles(item.x, item.y, '#fbbf24', 12);
                addFloatingText(`+${earnedPoints}`, item.x, item.y - 15, '#fbbf24');
              } else if (item.type === 'crystal') {
                sounds.playCatch(s.combo);
                emitParticles(item.x, item.y, '#38bdf8', 16);
                addFloatingText(`+${earnedPoints}`, item.x, item.y - 15, '#38bdf8');
              } else if (item.type === 'gem') {
                sounds.playGem();
                emitParticles(item.x, item.y, '#34d399', 22);
                addFloatingText(`+${earnedPoints} GEM!`, item.x, item.y - 15, '#34d399');
              } else if (item.type === 'heart') {
                sounds.playHeart();
                s.lives = Math.min(3, s.lives + 1);
                emitParticles(item.x, item.y, '#f43f5e', 18);
                addFloatingText('+1 LIFE', item.x, item.y - 15, '#f43f5e');
              } else if (item.type === 'clock') {
                sounds.playSlowMo();
                s.slowMoRemaining = 5000;
                emitParticles(item.x, item.y, '#818cf8', 20);
                addFloatingText('SLOW MOTION!', item.x, item.y - 15, '#818cf8');
              }

              onUpdateStats((prev) => ({
                ...prev,
                score: s.score,
                highScore: s.highScore,
                combo: s.combo,
                maxCombo: s.maxCombo,
                itemsCaught: s.itemsCaught,
                lives: s.lives,
                slowMoActive: s.slowMoRemaining > 0,
                slowMoRemaining: s.slowMoRemaining,
              }));
            }
            continue;
          }

          // Off-screen check (dropped item)
          if (item.y > height + 25) {
            s.items.splice(i, 1);
            // Dropping a star or crystal breaks combo
            if (item.type !== 'bomb' && s.combo > 1) {
              s.combo = 1;
              onUpdateStats((prev) => ({ ...prev, combo: 1 }));
            }
          }
        }
      }

      // DRAW FALLING ITEMS
      for (const item of s.items) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (item.type === 'star') {
          // Glow
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#fbbf24';
          // Draw 5-pointed star
          ctx.beginPath();
          for (let p = 0; p < 5; p++) {
            const outerAngle = (p * Math.PI * 2) / 5 - Math.PI / 2;
            const innerAngle = outerAngle + Math.PI / 5;
            const ox = Math.cos(outerAngle) * item.radius;
            const oy = Math.sin(outerAngle) * item.radius;
            const ix = Math.cos(innerAngle) * (item.radius * 0.45);
            const iy = Math.sin(innerAngle) * (item.radius * 0.45);
            if (p === 0) ctx.moveTo(ox, oy);
            else ctx.lineTo(ox, oy);
            ctx.lineTo(ix, iy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (item.type === 'crystal') {
          // Diamond crystal
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.moveTo(0, -item.radius);
          ctx.lineTo(item.radius * 0.75, 0);
          ctx.lineTo(0, item.radius);
          ctx.lineTo(-item.radius * 0.75, 0);
          ctx.closePath();
          ctx.fill();

          // Highlight facet
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.moveTo(0, -item.radius);
          ctx.lineTo(item.radius * 0.75, 0);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
        } else if (item.type === 'gem') {
          // Hexagonal Emerald Gem
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const rad = (a * Math.PI) / 3;
            const gx = Math.cos(rad) * item.radius;
            const gy = Math.sin(rad) * item.radius;
            if (a === 0) ctx.moveTo(gx, gy);
            else ctx.lineTo(gx, gy);
          }
          ctx.closePath();
          ctx.fill();

          // Core facet
          ctx.fillStyle = '#a7f3d0';
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const rad = (a * Math.PI) / 3;
            const gx = Math.cos(rad) * (item.radius * 0.45);
            const gy = Math.sin(rad) * (item.radius * 0.45);
            if (a === 0) ctx.moveTo(gx, gy);
            else ctx.lineTo(gx, gy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (item.type === 'heart') {
          // Floating Heart
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          const r = item.radius * 0.85;
          ctx.moveTo(0, r * 0.7);
          ctx.bezierCurveTo(-r, 0, -r, -r, 0, -r * 0.5);
          ctx.bezierCurveTo(r, -r, r, 0, 0, r * 0.7);
          ctx.fill();
        } else if (item.type === 'clock') {
          // Slow-Mo Clock / Orb
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#6366f1';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#c7d2fe';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -item.radius * 0.6);
          ctx.moveTo(0, 0);
          ctx.lineTo(item.radius * 0.5, 0);
          ctx.stroke();
        } else if (item.type === 'bomb') {
          // Hazard Spike Bomb
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius * 0.85, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Spikes
          ctx.fillStyle = '#ef4444';
          for (let sp = 0; sp < 8; sp++) {
            const spAngle = (sp * Math.PI * 2) / 8;
            const sx = Math.cos(spAngle) * (item.radius * 1.05);
            const sy = Math.sin(spAngle) * (item.radius * 1.05);
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Fuse spark
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(0, -item.radius * 1.1, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // DRAW PARTICLES
      for (let p = s.particles.length - 1; p >= 0; p--) {
        const part = s.particles[p];
        part.life += dt;
        if (part.life >= part.maxLife) {
          s.particles.splice(p, 1);
          continue;
        }

        part.x += part.vx * dt;
        part.y += part.vy * dt;
        const progress = part.life / part.maxLife;
        const alpha = 1 - progress;

        ctx.save();
        ctx.fillStyle = part.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = part.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // DRAW FLOATING TEXTS
      for (let t = s.floatingTexts.length - 1; t >= 0; t--) {
        const ft = s.floatingTexts[t];
        ft.y += ft.vy * dt;
        ft.opacity -= dt * 1.2;
        ft.scale = Math.max(1, ft.scale - dt * 0.5);

        if (ft.opacity <= 0) {
          s.floatingTexts.splice(t, 1);
          continue;
        }

        ctx.save();
        ctx.font = 'bold 15px monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.opacity;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // DRAW PADDLE
      const paddleY = height - 50;
      const paddleW = s.paddleWidth;
      const paddleH = s.paddleHeight;
      const paddleX = s.paddleX;

      ctx.save();
      // Paddle glow
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 18;

      // Outer pill capsule
      const cornerRadius = paddleH / 2;
      const pLeft = paddleX - paddleW / 2;
      const pTop = paddleY - paddleH / 2;

      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.roundRect(pLeft, pTop, paddleW, paddleH, cornerRadius);
      ctx.fill();

      // Border stroke
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glowing core bar
      ctx.shadowColor = '#a5b4fc';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.roundRect(
        paddleX - (paddleW - 20) / 2,
        paddleY - 3,
        paddleW - 20,
        6,
        3
      );
      ctx.fill();

      // Collector magnetic arcs on sides
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pLeft + cornerRadius, paddleY, cornerRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pLeft + paddleW - cornerRadius, paddleY, cornerRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      ctx.restore(); // restore shake
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [status, onUpdateStats, onGameOver]);

  return (
    <div
      ref={containerRef}
      id="arcade-canvas-container"
      className="relative w-full h-full min-h-[460px] overflow-hidden select-none cursor-crosshair bg-slate-950"
    >
      <canvas
        ref={canvasRef}
        id="arcade-game-canvas"
        onPointerMove={handlePointerMove}
        className="block w-full h-full touch-none"
      />
    </div>
  );
};
