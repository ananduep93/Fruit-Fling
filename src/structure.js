// Structure Blocks for Fruit Fling

var Matter = window.Matter;
var { Body } = Matter;

const MATERIALS = {
  wood: {
    color: '#cd853f', // Peru brown
    sideColor: '#8b5a2b', // Darker brown
    highlightColor: '#ffb573', // Light highlight
    debrisColor: '#a0522d',
    density: 0.0018,
    bounciness: 0.05,
    maxHealth: 90,
    scoreValue: 80,
    impactSound: 'impact_wood'
  },
  bamboo: {
    color: '#9acd32', // Yellow green
    sideColor: '#6b8e23', // Olive green
    highlightColor: '#c0ff3e',
    debrisColor: '#556b2f',
    density: 0.0012, // very light
    bounciness: 0.12,
    maxHealth: 45,
    scoreValue: 40,
    impactSound: 'impact_bamboo'
  },
  stone: {
    color: '#9c9c9c', // Stone grey
    sideColor: '#636363', // Dark slate grey
    highlightColor: '#d3d3d3',
    debrisColor: '#525252',
    density: 0.0035, // heavy
    bounciness: 0.01, // low bounce
    maxHealth: 250,
    scoreValue: 200,
    impactSound: 'impact_stone'
  },
  metal: {
    color: '#778899', // Metallic slate blue
    sideColor: '#4f5d73', // Deep steel grey
    highlightColor: '#b0c4de',
    debrisColor: '#2f4f4f',
    density: 0.0068, // extremely heavy
    bounciness: 0.04,
    maxHealth: 550,
    scoreValue: 500,
    impactSound: 'impact_metal'
  },
  glass: {
    color: 'rgba(173, 216, 230, 0.45)', // Ice blue semi-transparent
    sideColor: 'rgba(95, 158, 160, 0.65)',
    highlightColor: 'rgba(255, 255, 255, 0.8)',
    debrisColor: 'rgba(135, 206, 250, 0.6)',
    density: 0.0015,
    bounciness: 0.25, // slick & bouncy
    maxHealth: 25, // very fragile
    scoreValue: 120,
    impactSound: 'impact_glass'
  }
};

class StructureBlock {
  constructor(x, y, width, height, shape = 'box', materialType = 'wood', angle = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.shape = shape; // box, circle, triangle
    this.materialType = materialType;
    this.angle = angle;
    
    this.body = null;
    this.isDead = false;
    this.isTemp = false; // builder shields
    
    this.material = MATERIALS[materialType] || MATERIALS.wood;
    this.maxHealth = this.material.maxHealth;
    this.health = this.maxHealth;
  }

  damage(amount, damageX, damageY) {
    if (this.isDead) return;

    this.health -= amount;

    // Trigger dust puffs at damage position
    const pos = this.body ? this.body.position : { x: this.x, y: this.y };
    particles.addDust(damageX || pos.x, damageY || pos.y, 3);
    
    if (amount > 15) {
      // Play material impact sounds on heavy strikes
      audio.playSfx(this.material.impactSound);
    }

    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.isDead) return;
    this.isDead = true;

    const pos = this.body ? this.body.position : { x: this.x, y: this.y };
    
    // Spawn satisfying debris
    particles.addDebris(pos.x, pos.y, this.material.debrisColor, 12, 1.1);
    
    // Play breaking audio (which is a heavy version of impact or explosion depending on size)
    audio.playSfx(this.material.impactSound);
    if (this.materialType === 'stone' || this.materialType === 'metal') {
      particles.triggerShake(4);
    } else {
      particles.triggerShake(2);
    }

    // Add points
    particles.addFloatingText(pos.x, pos.y, `+${this.material.scoreValue}`, '#ffffff', 14);

    if (physics.onBlockDestroyed) {
      physics.onBlockDestroyed(this);
    }

    if (this.body) {
      physics.removeBody(this.body);
      this.body = null;
    }
  }

  draw(ctx) {
    if (!this.body || this.isDead) return;

    const pos = this.body.position;
    const angle = this.body.angle;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    // 2.5D Extrusion Offset (isometric cabinet projection style)
    // Draw 3D side blocks underneath and to the right
    const extrude = 6; 
    
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2.0;

    if (this.shape === 'box') {
      // 1. Draw 3D sides (extruded box)
      ctx.fillStyle = this.material.sideColor;
      
      // Bottom side
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(-w / 2 + extrude, h / 2 + extrude);
      ctx.lineTo(w / 2 + extrude, h / 2 + extrude);
      ctx.lineTo(w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right side
      ctx.beginPath();
      ctx.moveTo(w / 2, -h / 2);
      ctx.lineTo(w / 2 + extrude, -h / 2 + extrude);
      ctx.lineTo(w / 2 + extrude, h / 2 + extrude);
      ctx.lineTo(w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Draw front face
      ctx.fillStyle = this.material.color;
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.fill();
      ctx.stroke();

      // 3. Draw bevel highlight (inner left and top)
      ctx.strokeStyle = this.material.highlightColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 1.5, h / 2 - 1.5);
      ctx.lineTo(-w / 2 + 1.5, -h / 2 + 1.5);
      ctx.lineTo(w / 2 - 1.5, -h / 2 + 1.5);
      ctx.stroke();

      // 4. Draw damage cracks
      this.drawCracks(ctx, -w / 2, -h / 2, w, h);

    } else if (this.shape === 'circle') {
      const r = w / 2;
      
      // 1. Draw 3D side (drop bottom-right cylinder)
      ctx.fillStyle = this.material.sideColor;
      ctx.beginPath();
      ctx.arc(extrude, extrude, r, 0, Math.PI * 2);
      ctx.fill();
      
      // Bridge cylinder edges
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI);
      ctx.lineTo(extrude, extrude + r);
      ctx.arc(extrude, extrude, r, Math.PI, 0, true);
      ctx.lineTo(r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Draw front face
      ctx.fillStyle = this.material.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Draw highlight glint
      ctx.fillStyle = this.material.highlightColor;
      ctx.beginPath();
      ctx.arc(-r / 3, -r / 3, r / 4, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw cracks on circular stone
      this.drawCracks(ctx, -r, -r, r * 2, r * 2);

    } else if (this.shape === 'triangle') {
      const r = w / 2;
      
      // Triangle nodes (pointing up)
      const p1 = { x: 0, y: -r };
      const p2 = { x: -r, y: r };
      const p3 = { x: r, y: r };

      // 3D extrusion sides for triangle
      ctx.fillStyle = this.material.sideColor;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x + extrude, p2.y + extrude);
      ctx.lineTo(p3.x + extrude, p3.y + extrude);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p3.x + extrude, p3.y + extrude);
      ctx.lineTo(p1.x + extrude, p1.y + extrude);
      ctx.lineTo(p1.x, p1.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front face
      ctx.fillStyle = this.material.color;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Highlight
      ctx.strokeStyle = this.material.highlightColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p2.x + 1, p2.y - 1);
      ctx.lineTo(p1.x, p1.y + 1);
      ctx.stroke();

      // Cracks
      this.drawCracks(ctx, -r, -r, r * 2, r * 2);
    }

    ctx.restore();
  }

  drawCracks(ctx, bx, by, w, h) {
    const healthRatio = this.health / this.maxHealth;
    if (healthRatio >= 0.75) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2.0;

    // Draw progressive crack lines based on damage
    ctx.beginPath();
    
    // Crack 1 (light damage)
    ctx.moveTo(bx + w * 0.2, by + h * 0.2);
    ctx.lineTo(bx + w * 0.35, by + h * 0.45);
    ctx.lineTo(bx + w * 0.25, by + h * 0.6);

    // Crack 2 (medium damage)
    if (healthRatio < 0.5) {
      ctx.moveTo(bx + w * 0.8, by + h * 0.7);
      ctx.lineTo(bx + w * 0.65, by + h * 0.5);
      ctx.lineTo(bx + w * 0.75, by + h * 0.3);
      ctx.lineTo(bx + w * 0.55, by + h * 0.2);
    }

    // Crack 3 (deep structural failure)
    if (healthRatio < 0.25) {
      ctx.moveTo(bx + w * 0.5, by + h * 0.1);
      ctx.lineTo(bx + w * 0.5, by + h * 0.9);
      ctx.moveTo(bx + w * 0.1, by + h * 0.5);
      ctx.lineTo(bx + w * 0.9, by + h * 0.5);
    }

    ctx.stroke();
    ctx.restore();
  }
}
window.MATERIALS = MATERIALS;
window.StructureBlock = StructureBlock;
