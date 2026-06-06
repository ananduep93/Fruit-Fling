// Particle System for game juices: trails, dust, debris, explosions, and screen shake

import { storage } from './storage.js';

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    
    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  // --- CAMERA SHAKE ---
  triggerShake(intensity) {
    if (!storage.getSetting('screenShake')) return;
    // Add to current shake up to a maximum
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 15);
  }

  updateShake() {
    if (this.shakeIntensity > 0.1) {
      // Random offset within the current intensity radius
      const angle = Math.random() * Math.PI * 2;
      this.shakeX = Math.cos(angle) * this.shakeIntensity;
      this.shakeY = Math.sin(angle) * this.shakeIntensity;
      
      // Decay shake
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  // --- FLOATING TEXT ---
  addFloatingText(x, y, text, color = '#ffffff', fontSize = 20) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      fontSize,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2 - Math.random() * 2,
      alpha: 1.0,
      decay: 0.02
    });
  }

  // --- PARTICLE EMITTERS ---

  // Add trail particle based on shop selection
  addTrail(x, y, style = 'classic') {
    const p = {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: 1.0,
      life: 0,
      maxLife: 30 + Math.random() * 15
    };

    switch (style) {
      case 'rainbow':
        const hues = [0, 60, 120, 180, 240, 300];
        p.hue = hues[Math.floor(Date.now() / 50) % hues.length];
        p.color = `hsla(${p.hue}, 90%, 60%, 1)`;
        p.size = 6 + Math.random() * 6;
        p.type = 'rainbow';
        p.decay = 0.035;
        break;
      case 'fire':
        p.vx = -1.5 - Math.random() * 2; // blow backwards slightly
        p.vy = (Math.random() - 0.5) * 1.5 - 0.5;
        p.color = Math.random() > 0.5 ? '#ff4500' : '#ffcc00'; // red-orange or yellow
        p.size = 4 + Math.random() * 5;
        p.type = 'fire';
        p.decay = 0.045;
        break;
      case 'sparkle':
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = (Math.random() - 0.5) * 2;
        p.color = '#00ffff'; // cyan glow
        p.size = 3 + Math.random() * 4;
        p.type = 'sparkle';
        p.decay = 0.03;
        break;
      case 'bubble':
        p.vy = -0.5 - Math.random() * 1.0; // float upwards
        p.color = 'rgba(173, 216, 230, 0.4)';
        p.size = 5 + Math.random() * 7;
        p.type = 'bubble';
        p.decay = 0.025;
        break;
      case 'classic':
      default:
        p.color = 'rgba(240, 240, 240, 0.5)';
        p.size = 7 + Math.random() * 5;
        p.type = 'smoke';
        p.decay = 0.03;
        break;
    }

    this.particles.push(p);
  }

  // Debris on block breakage
  addDebris(x, y, color, count = 8, speedScale = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1 + Math.random() * 5) * speedScale;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // slightly upward blast bias
        color,
        size: 3 + Math.random() * 6,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        gravity: 0.18,
        type: 'debris',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  // Dust puff on collisions
  addDust(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: 'rgba(211, 211, 211, 0.4)',
        size: 8 + Math.random() * 12,
        alpha: 0.6,
        decay: 0.03 + Math.random() * 0.02,
        type: 'dust'
      });
    }
  }

  // Large dynamic explosion
  addExplosion(x, y, radius = 80) {
    this.triggerShake(12);

    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: 'rgba(255, 200, 100, 0.4)',
      size: 5,
      maxSize: radius * 1.5,
      alpha: 0.8,
      decay: 0.04,
      type: 'shockwave'
    });

    // Fireballs
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 8);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        color: Math.random() > 0.4 ? '#ff5500' : (Math.random() > 0.5 ? '#ffaa00' : '#ffffff'),
        size: 10 + Math.random() * 15,
        alpha: 1.0,
        decay: 0.03 + Math.random() * 0.03,
        type: 'fireball'
      });
    }

    // Spark shower
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (4 + Math.random() * 12);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffcc33',
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        gravity: 0.1,
        type: 'spark'
      });
    }
  }

  // --- UPDATE ---
  update() {
    this.updateShake();

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Apply movement
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.gravity) {
        p.vy += p.gravity;
      }

      if (p.rotation !== undefined && p.rotSpeed) {
        p.rotation += p.rotSpeed;
      }

      // Special particle type behavior
      if (p.type === 'shockwave') {
        p.size += (p.maxSize - p.size) * 0.25;
      } else if (p.type === 'fire') {
        p.size = Math.max(0.1, p.size - 0.15);
      } else if (p.type === 'smoke' || p.type === 'dust') {
        p.size += 0.2; // expand smoke/dust
      }

      // Decay alpha
      p.alpha -= p.decay;

      // Remove dead particles
      if (p.alpha <= 0 || p.size <= 0.2) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.x += ft.vx;
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- DRAW ---
  draw(ctx) {
    ctx.save();
    
    // Draw Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      
      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'debris') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.type === 'sparkle') {
        // Draw star spark
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.lineTo(0, p.size);
          ctx.lineTo(p.size / 4, 0);
        }
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'bubble') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(p.x - p.size / 3, p.y - p.size / 3, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Default circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Floating Texts
    ctx.globalAlpha = 1.0;
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${ft.fontSize}px "Outfit", Arial, sans-serif`;
      ctx.textAlign = 'center';
      
      // Text drop shadow (canvas native)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(ft.text, ft.x, ft.y);
      
      // Clear shadow properties
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.restore();
  }
}

export const particles = new ParticleSystem();
