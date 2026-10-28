/**
 * Odd One Out — Particle & Confetti Engine (2026 Casual Party FX)
 * Lightweight, zero-dependency 60fps canvas particle system:
 * - Tap spark burst at touch coordinates
 * - Confetti shower on milestones & personal bests
 * - Screen shake & micro-feedback
 */
(function () {
  class FXEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.animId = null;
      this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      this.reducedMotion = false;
      this.colors = ['#ff3c91', '#33e6ff', '#ffdc48', '#62f5a7', '#b02dff', '#ffffff'];
    }

    init() {
      if (typeof document === 'undefined') return;
      let c = document.getElementById('fxCanvas');
      if (!c) {
        c = document.createElement('canvas');
        c.id = 'fxCanvas';
        c.className = 'fx-canvas';
        document.body.appendChild(c);
      }
      this.canvas = c;
      this.ctx = c.getContext('2d', { alpha: true });
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
    }

    setReducedMotion(val) {
      this.reducedMotion = !!val;
    }

    resize() {
      if (!this.canvas) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      if (this.ctx) {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      }
    }

    startLoop() {
      if (this.animId) return;
      const loop = () => {
        this.update();
        if (this.particles.length > 0) {
          this.animId = requestAnimationFrame(loop);
        } else {
          this.animId = null;
          if (this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
      };
      this.animId = requestAnimationFrame(loop);
    }

    update() {
      if (!this.ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.ctx.clearRect(0, 0, w, h);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.life -= p.decay;

        if (p.type === 'confetti') {
          p.rot += p.vRot;
          p.wobble += p.wobbleSpeed;
        }

        if (p.life <= 0 || p.y > h + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.life);

        if (p.type === 'spark') {
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.type === 'confetti') {
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rot);
          this.ctx.scale(Math.cos(p.wobble), 1);
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size2 / 2, p.size, p.size2);
        }

        this.ctx.restore();
      }
    }

    sparkBurst(x, y, color) {
      if (this.reducedMotion) return;
      this.init();
      const count = 18;
      const baseColor = color || '#33e6ff';

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 3.5 + Math.random() * 5.5;
        this.particles.push({
          type: 'spark',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          gravity: 0.16,
          friction: 0.94,
          size: 3.5 + Math.random() * 3.5,
          color: Math.random() > 0.4 ? baseColor : this.colors[Math.floor(Math.random() * this.colors.length)],
          life: 1,
          decay: 0.024 + Math.random() * 0.02
        });
      }
      this.startLoop();
    }

    confettiShower(count = 65) {
      if (this.reducedMotion) return;
      this.init();
      const w = window.innerWidth;

      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = -10 - Math.random() * 80;
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.9;
        const speed = 2 + Math.random() * 6;

        this.particles.push({
          type: 'confetti',
          x,
          y,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.6,
          vy: 2 + Math.random() * 4.5,
          gravity: 0.12,
          friction: 0.98,
          size: 7 + Math.random() * 6,
          size2: 4 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          wobble: Math.random() * 10,
          wobbleSpeed: 0.08 + Math.random() * 0.08,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          life: 1,
          decay: 0.007 + Math.random() * 0.006
        });
      }
      this.startLoop();
    }

    screenShake(intensity = 6) {
      if (this.reducedMotion) return;
      const el = document.querySelector('.app');
      if (!el) return;
      el.classList.remove('screen-shake');
      void el.offsetWidth;
      el.classList.add('screen-shake');
      setTimeout(() => el.classList.remove('screen-shake'), 320);
    }
  }

  window.oneShotFX = new FXEngine();
})();
