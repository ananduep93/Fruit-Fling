// Monkey targets for Fruit Fling

var Matter = window.Matter;
var { Body, Constraint, World } = Matter;

class Monkey {
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.body = null;
    
    // Balloon monkey references
    this.balloonBody = null;
    this.balloonConstraint = null;
    
    this.isDead = false;
    this.scared = false;
    this.hasSpawnedShield = false;
    
    this.radius = 20;
    this.maxHealth = 50;
    this.health = 50;
    this.scoreValue = 500;
    this.color = '#a0522d'; // sienna brown
    
    this.setupTypeProperties();
  }

  setupTypeProperties() {
    switch (this.type) {
      case 'tough':
        this.radius = 22;
        this.maxHealth = 130;
        this.health = 130;
        this.scoreValue = 1000;
        this.color = '#8b7355';
        break;
      case 'builder':
        this.radius = 21;
        this.maxHealth = 80;
        this.health = 80;
        this.scoreValue = 800;
        this.color = '#cd853f';
        break;
      case 'balloon':
        this.radius = 18;
        this.maxHealth = 35;
        this.health = 35;
        this.scoreValue = 750;
        this.color = '#b5651d';
        break;
      case 'king':
        this.radius = 38;
        this.maxHealth = 480;
        this.health = 480;
        this.scoreValue = 3000;
        this.color = '#8b4513'; // saddle brown
        break;
      case 'basic':
      default:
        this.radius = 20;
        this.maxHealth = 50;
        this.health = 50;
        this.scoreValue = 500;
        this.color = '#a0522d';
        break;
    }
  }

  // Setup balloon and constraint in Matter.js world
  setupBalloon(world) {
    if (this.type !== 'balloon' || !this.body) return;

    Body.setStatic(this.body, true);

    // Create balloon body above monkey
    const bx = this.body.position.x;
    const by = this.body.position.y - 70;
    
    this.balloonBody = Matter.Bodies.circle(bx, by, 16, {
      friction: 0.1,
      restitution: 0.6,
      density: 0.0004, // very light density so it floats up easily
      label: 'balloon',
      plugin: { monkey: this }
    });

    // Create string constraint
    this.balloonConstraint = Constraint.create({
      bodyA: this.body,
      bodyB: this.balloonBody,
      stiffness: 0.6,
      length: 65,
      render: { visible: false } // we draw the string ourselves
    });

    World.add(world, [this.balloonBody, this.balloonConstraint]);
  }

  popBalloon(game) {
    if (this.type !== 'balloon' || !this.balloonBody) return;

    // Play balloon pop audio and spawn rubber pieces
    audio.playSfx('split'); // high pop
    const bx = this.balloonBody.position.x;
    const by = this.balloonBody.position.y;
    
    particles.addDebris(bx, by, '#ff3333', 12, 1.2); // red balloon fragments
    particles.addFloatingText(bx, by - 15, 'POP!', '#ff5555', 18);

    // Remove balloon from world
    physics.removeBody(this.balloonBody);
    if (this.balloonConstraint) {
      physics.removeBody(this.balloonConstraint);
    }
    
    this.balloonBody = null;
    this.balloonConstraint = null;

    // Wake up monkey body and let it fall
    if (this.body) {
      Body.setStatic(this.body, false);
    }
  }

  damage(amount) {
    if (this.isDead) return;

    this.health -= amount;
    
    // If balloon monkey is hit, pop its balloon so it falls
    if (this.type === 'balloon' && this.balloonBody) {
      this.popBalloon(window.game);
    }
    
    // Show splash points or health deduction
    const pos = this.body ? this.body.position : { x: this.x, y: this.y };
    particles.addFloatingText(pos.x, pos.y - 15, `-${Math.round(amount)}`, '#ff3333', 16);
    particles.triggerShake(3);

    if (this.health <= 0) {
      this.die();
    } else {
      audio.playSfx('monkey_hit');
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    const pos = this.body ? this.body.position : { x: this.x, y: this.y };
    
    // Poof effect
    particles.addDust(pos.x, pos.y, 18);
    particles.addDebris(pos.x, pos.y, '#ffd39b', 8, 1.0); // skin colored debris
    particles.addFloatingText(pos.x, pos.y - 20, `+${this.scoreValue}`, '#00ff66', 22);

    if (physics.onMonkeyKilled) {
      physics.onMonkeyKilled(this);
    }

    audio.playSfx('monkey_laugh'); // happy death laugh

    if (this.balloonBody) {
      physics.removeBody(this.balloonBody);
      if (this.balloonConstraint) {
        physics.removeBody(this.balloonConstraint);
      }
    }

    if (this.body) {
      physics.removeBody(this.body);
      this.body = null;
    }
  }

  update(fruits, game) {
    if (this.isDead || !this.body) return;

    const pos = this.body.position;

    // 1. Balloon Monkey Helium Effect
    if (this.type === 'balloon' && this.balloonBody) {
      // Apply constant upward buoyant force to the balloon body
      Body.applyForce(this.balloonBody, this.balloonBody.position, {
        x: 0,
        y: -0.0016 * this.balloonBody.mass
      });
      // Damp horizontal swings slightly
      Body.setVelocity(this.balloonBody, {
        x: this.balloonBody.velocity.x * 0.98,
        y: this.balloonBody.velocity.y
      });
    }

    // 2. Expression updates & Builder Shield spawning
    let nearestFruit = null;
    let minDist = Infinity;

    fruits.forEach(fruit => {
      if (fruit.isDead || !fruit.body) return;
      const fpos = fruit.body.position;
      const d = Matter.Vector.magnitude(Matter.Vector.sub(pos, fpos));
      if (d < minDist) {
        minDist = d;
        nearestFruit = fruit;
      }
    });

    // Scared if a fruit gets close (< 180px) and is flying fast
    if (nearestFruit && minDist < 180) {
      const speed = Matter.Vector.magnitude(nearestFruit.body.velocity);
      if (speed > 4) {
        this.scared = true;

        // Builder Monkey spawns a defensive shield once!
        if (this.type === 'builder' && !this.hasSpawnedShield && minDist < 140) {
          this.spawnDefenseShield(nearestFruit, game);
        }
      } else {
        this.scared = false;
      }
    } else {
      this.scared = false;
    }
  }

  spawnDefenseShield(fruit, game) {
    this.hasSpawnedShield = true;
    
    const pos = this.body.position;
    const fpos = fruit.body.position;
    
    // Direction vector from monkey to fruit
    const toFruit = Matter.Vector.normalise(Matter.Vector.sub(fpos, pos));
    
    // Place shield 45 pixels in front of monkey towards fruit
    const shieldX = pos.x + toFruit.x * 45;
    const shieldY = pos.y + toFruit.y * 45;
    
    // Compute angle of shield (perpendicular to direction)
    const angle = Math.atan2(toFruit.y, toFruit.x) + Math.PI / 2;

    // Create a dynamic wooden board block!
    const shieldBlock = game.spawnTemporaryBlock(shieldX, shieldY, 12, 60, angle, 'wood');
    
    // Apply slight forward impulse to shield to meet fruit
    if (shieldBlock.body) {
      Body.setVelocity(shieldBlock.body, { x: toFruit.x * 2.5, y: toFruit.y * 2.5 });
    }

    // Play builders construction sound/dust
    audio.playSfx('impact_wood');
    particles.addDust(shieldX, shieldY, 8);
    particles.addFloatingText(pos.x, pos.y - 30, 'CONSTRUCT!', '#ffd700', 16);
  }

  draw(ctx) {
    if (this.isDead || !this.body) return;

    const pos = this.body.position;
    const angle = this.body.angle;
    const r = this.radius;

    // 1. Draw Balloon string & Balloon if active
    if (this.type === 'balloon' && this.balloonBody) {
      const bpos = this.balloonBody.position;
      
      // Draw string
      ctx.save();
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      // add a small curve to string
      ctx.quadraticCurveTo((pos.x + bpos.x)/2 + Math.sin(Date.now() / 200) * 5, (pos.y + bpos.y)/2, bpos.x, bpos.y);
      ctx.stroke();
      ctx.restore();

      // Draw Balloon
      ctx.save();
      ctx.translate(bpos.x, bpos.y);
      ctx.rotate(this.balloonBody.angle);
      
      // Balloon body
      const bGrad = ctx.createRadialGradient(-5, -5, 1, 0, 0, 16);
      bGrad.addColorStop(0, '#ff9999');
      bGrad.addColorStop(1, '#ff2222');
      ctx.fillStyle = bGrad;
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 2.0;
      
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Balloon knot
      ctx.fillStyle = '#ff2222';
      ctx.beginPath();
      ctx.moveTo(-3, 17);
      ctx.lineTo(3, 17);
      ctx.lineTo(0, 21);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Balloon Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(-6, -6, 5, 3, Math.PI/4, 0, Math.PI*2);
      ctx.fill();
      
      ctx.restore();
    }

    // 2. Draw Monkey body
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 3;

    // Stroke outline
    ctx.strokeStyle = '#1e110a';
    ctx.lineWidth = 2.5;

    // Ears
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(-r * 0.9, -r * 0.1, r * 0.38, 0, Math.PI * 2);
    ctx.arc(r * 0.9, -r * 0.1, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Ears
    ctx.fillStyle = '#ffc0cb'; // pink
    ctx.beginPath();
    ctx.arc(-r * 0.9, -r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.9, -r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face Mask (lighter brown skin patch)
    ctx.fillStyle = '#ffd39b'; // light tan skin
    ctx.beginPath();
    // Double circle cheek overlay
    ctx.arc(-r * 0.35, r * 0.1, r * 0.6, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.1, r * 0.6, 0, Math.PI * 2);
    ctx.arc(0, -r * 0.15, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Face expression
    this.drawExpression(ctx, r);

    // Decorate hats/accessories based on Type
    this.drawAccessories(ctx, r);

    ctx.restore();

    // Draw Boss health bar if King Monkey
    if (this.type === 'king') {
      this.drawBossHealthBar(ctx, pos.x, pos.y - r - 25);
    }
  }

  drawExpression(ctx, r) {
    const eyeY = -r * 0.15;
    const eyeSpacing = r * 0.32;
    const eyeSize = r * 0.12;

    const isHurt = this.health < this.maxHealth * 0.4;

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.0;

    if (isHurt) {
      // Dizzy/dead eyes (X X)
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Left eye X
      ctx.moveTo(-eyeSpacing - 4, eyeY - 4); ctx.lineTo(-eyeSpacing + 4, eyeY + 4);
      ctx.moveTo(-eyeSpacing - 4, eyeY + 4); ctx.lineTo(-eyeSpacing + 4, eyeY - 4);
      // Right eye X
      ctx.moveTo(eyeSpacing - 4, eyeY - 4); ctx.lineTo(eyeSpacing + 4, eyeY + 4);
      ctx.moveTo(eyeSpacing - 4, eyeY + 4); ctx.lineTo(eyeSpacing + 4, eyeY - 4);
      ctx.stroke();

      // Dizzy flat line mouth
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, r * 0.3);
      ctx.bezierCurveTo(-r*0.1, r*0.2, r*0.1, r*0.4, r*0.2, r*0.3);
      ctx.stroke();

    } else if (this.scared) {
      // Wide open eyes with small pupils
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize * 2.0, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, eyeSize * 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 1.5, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Scared eyebrows
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY - 6, 6, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.arc(eyeSpacing, eyeY - 6, 6, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();

      // Big O-shaped mouth
      ctx.fillStyle = '#ff6666';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else {
      // Normal smiling monkey
      // Eyes
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY - 3, 4, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.arc(eyeSpacing, eyeY - 3, 4, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();

      // Cute Smile mouth
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, r * 0.2, r * 0.32, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
  }

  drawAccessories(ctx, r) {
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = '#222222';

    if (this.type === 'tough') {
      // Draw military/knight helmet
      ctx.fillStyle = '#778899'; // grey slate helmet
      ctx.beginPath();
      ctx.arc(0, -r * 0.3, r * 0.95, Math.PI, 0); // dome
      ctx.lineTo(r * 0.95, -r * 0.2);
      ctx.lineTo(r * 0.6, r * 0.15); // cheek protector
      ctx.lineTo(-r * 0.6, r * 0.15);
      ctx.lineTo(-r * 0.95, -r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Helmet visor line/ridge
      ctx.strokeStyle = '#4f5d73';
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, -r * 0.3);
      ctx.quadraticCurveTo(0, -r * 0.45, r * 0.9, -r * 0.3);
      ctx.stroke();

    } else if (this.type === 'builder') {
      // Draw yellow construction hard hat
      ctx.fillStyle = '#ffd700'; // yellow construction gold
      ctx.beginPath();
      ctx.arc(0, -r * 0.4, r * 0.9, Math.PI * 1.05, Math.PI * 1.95); // dome
      // brim
      ctx.quadraticCurveTo(0, -r * 0.3, -r * 1.1, -r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Center ridge
      ctx.fillStyle = '#e6b800';
      ctx.fillRect(-r * 0.12, -r * 1.25, r * 0.24, r * 0.8);
      ctx.strokeRect(-r * 0.12, -r * 1.25, r * 0.24, r * 0.8);

    } else if (this.type === 'king') {
      // Giant crown
      ctx.fillStyle = '#ffd700'; // gold
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.8);
      ctx.lineTo(-r * 0.9, -r * 1.6);
      ctx.lineTo(-r * 0.4, -r * 1.2);
      ctx.lineTo(0, -r * 1.8); // tall middle crown peak
      ctx.lineTo(r * 0.4, -r * 1.2);
      ctx.lineTo(r * 0.9, -r * 1.6);
      ctx.lineTo(r * 0.8, -r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crown jewels
      ctx.fillStyle = '#ff0000'; // red rubies
      ctx.beginPath();
      ctx.arc(-r * 0.9, -r * 1.6, 3, 0, Math.PI * 2);
      ctx.arc(0, -r * 1.8, 4, 0, Math.PI * 2);
      ctx.arc(r * 0.9, -r * 1.6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBossHealthBar(ctx, bx, by) {
    const width = 80;
    const height = 7;
    const ratio = Math.max(0, this.health / this.maxHealth);

    ctx.save();
    
    // Background bar (black shadow outline)
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx - width / 2 - 1, by - 1, width + 2, height + 2);

    // Red lost health bar
    ctx.fillStyle = '#550000';
    ctx.fillRect(bx - width / 2, by, width, height);

    // Green remaining health bar
    ctx.fillStyle = ratio > 0.5 ? '#00ff66' : (ratio > 0.2 ? '#ffcc00' : '#ff3333');
    ctx.fillRect(bx - width / 2, by, width * ratio, height);

    // Boss Name text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Outfit", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KING MONKEY', bx, by - 4);

    ctx.restore();
  }
}
window.Monkey = Monkey;
