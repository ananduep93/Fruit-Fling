// Fruit class and specialized sub-types for Fruit Fling

var Matter = window.Matter;
var { Body, Vector } = Matter;

class Fruit {
  constructor(x, y, type = 'apple') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.body = null;
    
    this.isLaunched = false;
    this.hasUsedAbility = false;
    this.isDead = false;
    
    this.trailPoints = [];
    this.maxTrailPoints = 35;
    this.trailTimer = 0;
    
    // Type specific settings
    this.radius = 18;
    this.density = 0.002;
    this.restitution = 0.2;
    this.color = '#ff3333';
    this.abilityText = '';
    
    this.setupTypeProperties();
  }

  setupTypeProperties() {
    switch (this.type) {
      case 'coconut':
        this.radius = 24;
        this.density = 0.0055; // very heavy
        this.restitution = 0.08; // low bounce
        this.color = '#8b5a2b';
        this.abilityText = 'COCO BOMB!';
        break;
      case 'banana':
        this.radius = 15;
        this.density = 0.0016; // light
        this.restitution = 0.25;
        this.color = '#ffdd33';
        this.abilityText = 'BANANA BOOST!';
        break;
      case 'strawberry':
        this.radius = 16;
        this.density = 0.0019;
        this.restitution = 0.2;
        this.color = '#ff2b4b';
        this.abilityText = 'STRAWBERRY GROW!';
        break;
      case 'watermelon':
        this.radius = 26;
        this.density = 0.0026; // medium-heavy
        this.restitution = 0.15;
        this.color = '#2e8b57';
        this.abilityText = 'MELON SPLIT!';
        break;
      case 'watermelon_mini':
        this.radius = 14;
        this.density = 0.0018;
        this.restitution = 0.3; // bouncy
        this.color = '#ff5566';
        this.isLaunched = true;
        this.hasUsedAbility = true; // no sub-abilities
        break;
      case 'apple':
      default:
        this.radius = 18;
        this.density = 0.0019; // standard
        this.restitution = 0.18;
        this.color = '#ff2b2b';
        this.abilityText = 'APPLE SMASH!';
        break;
    }
  }

  launch(velocity) {
    if (!this.body) return;
    this.isLaunched = true;
    Body.setStatic(this.body, false);
    Body.setVelocity(this.body, velocity);
    audio.playSfx('launch');
  }

  // Called in the game loop
  update() {
    if (!this.body || this.isDead) return;

    // Apply gravity reduction buffs from Coral Slingshot and Water Bubbles trail
    if (this.isLaunched) {
      const slingshot = storage.getSelectedItem('slingshot');
      const trail = storage.getSelectedItem('trail');
      let gravReduction = 0;
      if (slingshot === 'bubble') gravReduction += 0.20; // -20% gravity
      if (trail === 'bubble') gravReduction += 0.10; // -10% gravity from water bubbles
      
      if (gravReduction > 0) {
        const gravityForce = this.body.mass * physics.engine.gravity.y * 0.001;
        Matter.Body.applyForce(this.body, this.body.position, {
          x: 0,
          y: -gravReduction * gravityForce
        });
      }
    }

    // Track trail position when flying fast
    const speed = Vector.magnitude(this.body.velocity);
    if (this.isLaunched && speed > 1.5) {
      this.trailTimer++;
      if (this.trailTimer % 2 === 0) {
        this.trailPoints.push({ x: this.body.position.x, y: this.body.position.y });
        if (this.trailPoints.length > this.maxTrailPoints) {
          this.trailPoints.shift();
        }

        // Add active trail particle effect to the particle system
        const selectedTrail = storage.getSelectedItem('trail');
        particles.addTrail(this.body.position.x, this.body.position.y, selectedTrail);
      }
    }
  }

  // Trigger special ability mid-air
  triggerAbility(game) {
    if (!this.isLaunched || this.hasUsedAbility || this.isDead) return;
    this.hasUsedAbility = true;

    const pos = this.body.position;
    const vel = this.body.velocity;

    switch (this.type) {
      case 'coconut':
        this.explode();
        break;

      case 'apple':
        audio.playSfx('boost');
        particles.addFloatingText(pos.x, pos.y - 20, 'APPLE SMASH!', '#ff2b2b', 22);
        Body.setVelocity(this.body, { x: vel.x * 1.15, y: Math.max(vel.y, 0) + 14 });
        for (let i = 0; i < 15; i++) {
          particles.addTrail(pos.x, pos.y, 'classic');
        }
        break;

      case 'banana':
        // Curve upwards and gain a huge speed boost
        audio.playSfx('boost');
        particles.addFloatingText(pos.x, pos.y - 20, this.abilityText, '#ffee00', 22);
        
        // Apply forward and upward vector
        const newVx = vel.x * 1.7;
        const newVy = vel.y - 3.5; // push up
        Body.setVelocity(this.body, { x: newVx, y: newVy });
        
        // Spawn banana sparkle shower
        for (let i = 0; i < 15; i++) {
          particles.addTrail(pos.x, pos.y, 'sparkle');
        }
        break;

      case 'strawberry':
        // Gain size and mass dynamically
        audio.playSfx('boost');
        particles.addFloatingText(pos.x, pos.y - 20, 'GIANT STRAWBERRY!', '#ff2b4b', 24);

        // Scale Matter body
        Matter.Body.scale(this.body, 2.5, 2.5);
        Matter.Body.setDensity(this.body, 0.0075);
        
        this.radius = 40;
        
        // Sparkle burst
        for (let i = 0; i < 20; i++) {
          particles.addTrail(pos.x, pos.y, 'sparkle');
        }
        break;

      case 'watermelon':
        // Split into three smaller watermelons
        audio.playSfx('split');
        particles.addFloatingText(pos.x, pos.y - 20, this.abilityText, '#ff5566', 22);

        const currentSpeed = Vector.magnitude(vel);
        const baseAngle = Math.atan2(vel.y, vel.x);

        // Define 3 spread angles: straight, up 15 degrees, down 15 degrees
        const angles = [baseAngle - 0.22, baseAngle, baseAngle + 0.22];

        angles.forEach((angle, idx) => {
          const spawnVx = Math.cos(angle) * currentSpeed * 1.1;
          const spawnVy = Math.sin(angle) * currentSpeed * 1.1;

          // Slightly offset spawn positions so they don't overlap immediately
          const spawnX = pos.x + Math.cos(angle) * 15;
          const spawnY = pos.y + Math.sin(angle) * 15;

          const miniMelon = new Fruit(spawnX, spawnY, 'watermelon_mini');
          
          // Set parent's skin so they match
          const miniBody = physics.addFruitBody(miniMelon);
          miniMelon.launch({ x: spawnVx, y: spawnVy });
          
          game.fruitsOnField.push(miniMelon);

          // Set the middle mini-melon as the active tracking fruit!
          if (idx === 1) {
            game.activeFruit = miniMelon;
          }
        });

        // Kill parent melon and remove body
        this.destroy();
        break;
    }
  }

  explode() {
    const pos = this.body.position;
    
    // Play explosion sound and particles
    audio.playSfx('explosion');
    particles.addExplosion(pos.x, pos.y, 115);
    particles.addFloatingText(pos.x, pos.y - 20, 'BOOM!', '#ff4400', 24);

    // Apply radial force in physics engine
    physics.applyExplosionForce(pos.x, pos.y, 140, 4.0);

    // Remove fruit from game
    this.destroy();
  }

  destroy() {
    this.isDead = true;
    if (this.body) {
      physics.removeBody(this.body);
      this.body = null;
    }
  }

  onHit(force, targetLabel) {
    if (this.isDead) return;

    // Custom sound effect trigger based on impact force and target
    if (force > 5) {
      // Play matching impact audio
      if (targetLabel === 'block') {
        // audio played by the block itself or general fruit impact
      } else if (targetLabel === 'monkey') {
        audio.playSfx('monkey_hit');
      } else {
        // generic thud
        audio.playSfx('impact_wood');
      }
    }
  }

  draw(ctx) {
    if (!this.body || this.isDead) return;

    const pos = this.body.position;
    const angle = this.body.angle;
    const radius = this.radius;

    // Draw trail line if launched
    if (this.trailPoints.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
      for (let i = 1; i < this.trailPoints.length; i++) {
        ctx.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      }
      ctx.strokeStyle = this.type === 'coconut' ? 'rgba(100, 80, 70, 0.25)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = radius * 0.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    const isGoldenSkin = storage.getSelectedItem('fruitSkin') === 'golden';
    
    // Draw 3D shadow offset
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;
    ctx.shadowOffsetX = 1;

    if (isGoldenSkin) {
      this.drawGoldenFruit(ctx, radius);
    } else {
      this.drawCartoonFruit(ctx, radius);
    }

    ctx.restore();
  }

  drawCartoonFruit(ctx, r) {
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2.5;

    switch (this.type) {
      case 'apple':
        // Red apple shape
        ctx.fillStyle = '#ff333d';
        ctx.beginPath();
        // A heart-ish round shape
        ctx.arc(-r/5, 0, r * 0.95, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.arc(r/5, 0, r * 0.95, 1.2 * Math.PI, 0.8 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Stem & Leaf
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(-2, -r - 4, 3, 6);
        ctx.fillStyle = '#32cd32';
        ctx.beginPath();
        ctx.ellipse(r/3, -r - 2, 6, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shiny Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-r/2, -r/2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Cartoon Face
        this.drawFace(ctx, r, 'happy');
        break;

      case 'coconut':
        // Brown circular shell
        ctx.fillStyle = '#7a4e28';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair spikes (texture)
        ctx.strokeStyle = '#5c3a1e';
        ctx.lineWidth = 2.0;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
          ctx.lineTo(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3));
          ctx.stroke();
        }

        // Inner crack line
        ctx.strokeStyle = '#ffe4c4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r/3, -r/3);
        ctx.lineTo(0, -r/6);
        ctx.lineTo(r/3, -r/2);
        ctx.stroke();

        // Face
        this.drawFace(ctx, r, 'tough');
        break;

      case 'banana':
        // Curved banana shape
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        // Draw crescent banana
        ctx.arc(0, 0, r * 1.2, -0.4 * Math.PI, 0.7 * Math.PI);
        ctx.arc(r * 0.4, -r * 0.2, r * 1.0, 0.7 * Math.PI, -0.4 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Green tips
        ctx.fillStyle = '#a2cd5a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.2, -0.4 * Math.PI, -0.32 * Math.PI);
        ctx.lineTo(r * 0.5, -r * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Face
        this.drawFace(ctx, r * 0.9, 'cheeky');
        break;

      case 'strawberry':
        // Teardrop strawberry body
        ctx.fillStyle = '#ff2b4b'; // bright strawberry red
        ctx.beginPath();
        // Path starting from top-left curving down to bottom tip and back to top-right
        ctx.moveTo(0, r * 1.1); // bottom tip
        // Curve to left side
        ctx.bezierCurveTo(-r * 1.3, r * 0.4, -r * 1.1, -r * 0.8, 0, -r * 0.9);
        // Curve to right side
        ctx.bezierCurveTo(r * 1.1, -r * 0.8, r * 1.3, r * 0.4, 0, r * 1.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Seed dots (small yellow spots)
        ctx.fillStyle = '#ffee66';
        const seedPoints = [
          {x: -r * 0.4, y: -r * 0.3}, {x: 0, y: -r * 0.45}, {x: r * 0.4, y: -r * 0.3},
          {x: -r * 0.5, y: r * 0.15}, {x: 0, y: 0}, {x: r * 0.5, y: r * 0.15},
          {x: -r * 0.25, y: r * 0.5}, {x: r * 0.25, y: r * 0.5}, {x: 0, y: r * 0.8}
        ];
        seedPoints.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
        });

        // Green leafy cap on top
        ctx.fillStyle = '#4cd137';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.8);
        ctx.lineTo(-r * 0.6, -r * 1.1);
        ctx.lineTo(-r * 0.25, -r * 0.85);
        ctx.lineTo(0, -r * 1.3); // center leaf stem
        ctx.lineTo(r * 0.25, -r * 0.85);
        ctx.lineTo(r * 0.6, -r * 1.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Face: determined when small, scared when giant
        this.drawFace(ctx, r, this.radius > 20 ? 'scared' : 'determined');
        break;

      case 'watermelon':
      case 'watermelon_mini':
        const isMini = this.type === 'watermelon_mini';
        
        // Striped dark and light green circle
        ctx.fillStyle = '#2e8b57'; // base green
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stripes
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = isMini ? 1.5 : 2.5;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.arc(i * (r * 0.35), 0, r * 0.9, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        }

        // Draw cute wedge slice indicator on watermelon, or just eyes
        if (!isMini) {
          this.drawFace(ctx, r, 'happy_large');
        } else {
          this.drawFace(ctx, r, 'happy');
        }
        break;
    }
  }

  // Draw golden skin variant
  drawGoldenFruit(ctx, r) {
    ctx.strokeStyle = '#8b6508';
    ctx.lineWidth = 2.5;

    // Radiant gold gradient
    const grad = ctx.createRadialGradient(-r/3, -r/3, 1, 0, 0, r);
    grad.addColorStop(0, '#fff3a8');
    grad.addColorStop(0.3, '#ffd700');
    grad.addColorStop(0.8, '#e6b800');
    grad.addColorStop(1, '#b8860b');

    ctx.fillStyle = grad;

    if (this.type === 'banana') {
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.2, -0.4 * Math.PI, 0.7 * Math.PI);
      ctx.arc(r * 0.4, -r * 0.2, r * 1.0, 0.7 * Math.PI, -0.4 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.drawFace(ctx, r * 0.9, 'rich');
    } else if (this.type === 'strawberry') {
      ctx.beginPath();
      ctx.moveTo(0, r * 1.1);
      ctx.bezierCurveTo(-r * 1.3, r * 0.4, -r * 1.1, -r * 0.8, 0, -r * 0.9);
      ctx.bezierCurveTo(r * 1.1, -r * 0.8, r * 1.3, r * 0.4, 0, r * 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.drawFace(ctx, r, 'rich');
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawFace(ctx, r, 'rich');
    }
  }

  drawFace(ctx, r, style) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.0;

    const eyeSize = r * 0.15;
    const eyeSpacing = r * 0.32;
    const eyeY = -r * 0.15;

    if (style === 'happy' || style === 'happy_large') {
      // Big cartoon eyes
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      
      // Left eye
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Right eye
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, eyeSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-eyeSpacing + 1, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + 1, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Tiny white highlight inside pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeSpacing - 0.5, eyeY - 1, 1.5, 0, Math.PI * 2);
      ctx.arc(eyeSpacing - 0.5, eyeY - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile mouth
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      
      // Cheeks
      ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
      ctx.beginPath();
      ctx.arc(-eyeSpacing * 1.4, r * 0.1, 4, 0, Math.PI * 2);
      ctx.arc(eyeSpacing * 1.4, r * 0.1, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (style === 'tough') {
      // Angry eyebrows and determination
      ctx.beginPath();
      // Left angry brow
      ctx.moveTo(-eyeSpacing - 5, eyeY - 6);
      ctx.lineTo(-eyeSpacing + 5, eyeY - 2);
      // Right angry brow
      ctx.moveTo(eyeSpacing + 5, eyeY - 6);
      ctx.lineTo(eyeSpacing - 5, eyeY - 2);
      ctx.stroke();

      // Determined squinty eyes
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize, 0, Math.PI, true);
      ctx.arc(eyeSpacing, eyeY, eyeSize, 0, Math.PI, true);
      ctx.stroke();

      // Tight line mouth
      ctx.beginPath();
      ctx.moveTo(-r * 0.25, r * 0.2);
      ctx.lineTo(r * 0.25, r * 0.18);
      ctx.stroke();

    } else if (style === 'determined') {
      // Focused eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize * 1.3, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, eyeSize * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-eyeSpacing + 2, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
      ctx.arc(eyeSpacing - 2, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Angry brows
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 6, eyeY - 8);
      ctx.lineTo(-eyeSpacing + 6, eyeY - 1);
      ctx.moveTo(eyeSpacing + 6, eyeY - 8);
      ctx.lineTo(eyeSpacing - 6, eyeY - 1);
      ctx.stroke();

      // W-mouth or small curve
      ctx.beginPath();
      ctx.arc(0, r * 0.2, r * 0.2, 0, Math.PI, true);
      ctx.stroke();

    } else if (style === 'cheeky') {
      // Wink eye
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2); // left eye open
      ctx.fill();
      
      // Right eye winking line
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 4, eyeY - 2);
      ctx.lineTo(eyeSpacing + 4, eyeY + 2);
      ctx.moveTo(eyeSpacing - 4, eyeY + 2);
      ctx.lineTo(eyeSpacing + 4, eyeY - 2);
      ctx.stroke();

      // Tongue sticking out!
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.25, 0, Math.PI);
      ctx.stroke();
      
      ctx.fillStyle = '#ff6688';
      ctx.beginPath();
      ctx.ellipse(2, r * 0.35, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (style === 'rich') {
      // Golden eyes (stars or dollar signs)
      ctx.fillStyle = '#b8860b';
      // Left star
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Right star
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Happy smile
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.35, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }
}
window.Fruit = Fruit;
