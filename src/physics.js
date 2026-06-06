// Matter.js Physics Engine Wrapper for Fruit Fling

const Matter = window.Matter;
import { particles } from './particles.js';
import { audio } from './audio.js';
import { storage } from './storage.js';

const { Engine, World, Bodies, Body, Composite, Vector, Events } = Matter;

class PhysicsSystem {
  constructor() {
    this.engine = null;
    this.ground = null;
    this.slingshotAnchor = { x: 180, y: 450 };
    
    // Boundary coordinates
    this.worldWidth = 2400; // scrollable world
    this.worldHeight = 720;
    
    // Collision callbacks
    this.onBlockHit = null;
    this.onMonkeyHit = null;
    this.onFruitHit = null;
    this.onBlockDestroyed = null;
    this.onMonkeyKilled = null;

    this.levelStartTime = 0;
  }

  init() {
    // Create Matter Engine
    this.engine = Engine.create({
      gravity: { y: 1.0, x: 0, scale: 0.001 } // standard earth-like gravity
    });

    // Set up collision event listener
    Events.on(this.engine, 'collisionStart', (event) => {
      this.handleCollisions(event.pairs);
    });

    // Also listen to ongoing collisions for slide/rub sounds if needed
  }

  setGravity(y = 1.0) {
    if (this.engine) {
      this.engine.gravity.y = y;
    }
  }

  update(deltaTime) {
    if (!this.engine) return;
    // Step engine (Vite runs 60fps, delta is around 16.6ms)
    // Using a fixed step is more stable for physics
    Engine.update(this.engine, Math.min(deltaTime, 30));
  }

  clear() {
    if (!this.engine) return;
    World.clear(this.engine.world, false);
    
    // Recreate boundaries
    this.createBoundaries();

    this.levelStartTime = Date.now();
  }

  createBoundaries() {
    const thickness = 100;
    
    // Ground
    const ground = Bodies.rectangle(
      this.worldWidth / 2, 
      700, // Top of the ground will be exactly at y = 650 (700 - 100/2)
      this.worldWidth, 
      thickness, 
      { isStatic: true, label: 'ground', friction: 1.0, frictionStatic: 1.0 }
    );
    this.ground = ground;
    
    // Left Wall
    const leftWall = Bodies.rectangle(
      -thickness / 2, 
      this.worldHeight / 2, 
      thickness, 
      this.worldHeight, 
      { isStatic: true, label: 'boundary' }
    );
    
    // Right Wall (barrier)
    const rightWall = Bodies.rectangle(
      this.worldWidth + thickness / 2, 
      this.worldHeight / 2, 
      thickness, 
      this.worldHeight, 
      { isStatic: true, label: 'boundary' }
    );
    
    // Add to world
    World.add(this.engine.world, [ground, leftWall, rightWall]);
  }

  // --- CREATION UTILITIES ---

  // Add block to physics world
  addBlockBody(block) {
    let body;
    const options = {
      friction: 1.0,
      frictionStatic: 1.0,
      restitution: block.material.bounciness,
      density: block.material.density,
      label: 'block',
      plugin: { block } // Link block instance to physics body
    };

    if (block.shape === 'circle') {
      body = Bodies.circle(block.x, block.y, block.width / 2, options);
    } else if (block.shape === 'triangle') {
      // Create a triangle body
      body = Bodies.polygon(block.x, block.y, 3, block.width / 2, options);
    } else {
      // Rectangle (wooden beams, stone boxes, etc.)
      body = Bodies.rectangle(block.x, block.y, block.width, block.height, options);
    }

    World.add(this.engine.world, body);
    block.body = body;
    return body;
  }

  // Add monkey to physics world
  addMonkeyBody(monkey) {
    const options = {
      friction: 0.9,
      restitution: 0.15,
      density: 0.0015, // medium density
      label: 'monkey',
      plugin: { monkey } // Link monkey instance
    };

    // Use circle body for monkey
    const body = Bodies.circle(monkey.x, monkey.y, monkey.radius, options);
    World.add(this.engine.world, body);
    monkey.body = body;
    return body;
  }

  // Add fruit to physics world
  addFruitBody(fruit) {
    let restitution = fruit.restitution;
    let frictionAir = 0.003; // standard low air resistance

    // Apply trail buffs
    const trail = storage.getSelectedItem('trail');
    if (trail === 'sparkle') {
      restitution = Math.min(0.9, restitution * 1.10); // +10% bounciness
    } else if (trail === 'bubble') {
      frictionAir *= 0.50; // -50% air resistance (flies farther!)
    }

    const options = {
      friction: 0.4,
      frictionAir: frictionAir,
      restitution: restitution,
      density: fruit.density,
      label: 'fruit',
      plugin: { fruit }
    };

    const body = Bodies.circle(fruit.x, fruit.y, fruit.radius, options);
    // Make fruit sensor/static during slingshot load (done inside fruit.js/main.js)
    World.add(this.engine.world, body);
    fruit.body = body;
    return body;
  }

  removeBody(body) {
    if (this.engine && body) {
      World.remove(this.engine.world, body);
    }
  }

  // Apply explosion impulse force
  applyExplosionForce(x, y, radius, forceFactor = 2.5) {
    const bodies = Composite.allBodies(this.engine.world);
    
    bodies.forEach(body => {
      if (body.isStatic) return;

      const dist = Vector.magnitude(Vector.sub(body.position, { x, y }));
      if (dist < radius) {
        // Falloff force based on distance
        const forceVal = (1 - dist / radius) * forceFactor * body.mass * 0.012;
        
        // Direction vector from blast center to body center
        let dir = Vector.normalise(Vector.sub(body.position, { x, y }));
        if (dir.x === 0 && dir.y === 0) {
          dir = { x: 0, y: -1 }; // blow straight up if exactly centered
        }
        
        const forceVector = Vector.mult(dir, forceVal);
        Body.applyForce(body, body.position, forceVector);
        
        // Damage blocks and monkeys in the blast radius
        if (body.label === 'block' && body.plugin.block) {
          const damage = (1 - dist / radius) * 150; // high explosive damage
          body.plugin.block.damage(damage, x, y);
        } else if (body.label === 'monkey' && body.plugin.monkey) {
          const damage = (1 - dist / radius) * 100;
          body.plugin.monkey.damage(damage);
        }
      }
    });
  }

  // --- COLLISION EVENTS HANDLING ---

  handleCollisions(pairs) {
    pairs.forEach(pair => {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Pop balloon on collision
      if (bodyA.label === 'balloon' && bodyA.plugin.monkey) {
        bodyA.plugin.monkey.popBalloon(window.game);
      }
      if (bodyB.label === 'balloon' && bodyB.plugin.monkey) {
        bodyB.plugin.monkey.popBalloon(window.game);
      }

      // Calculate relative impact velocity magnitude
      const relVel = Vector.sub(bodyA.velocity, bodyB.velocity);
      const speed = Vector.magnitude(relVel);
      
      // Calculate impact kinetic energy/force proxy based on mass and speed
      // (Using a simple speed-scaled mass logic)
      const minMass = Math.min(bodyA.mass, bodyB.mass) || 1.0;
      const impactForce = speed * Math.sqrt(minMass) * 5;

      const collisionPoint = (pair.activeContacts && pair.activeContacts[0]) ? pair.activeContacts[0].vertex : bodyA.position;
      const x = collisionPoint.x;
      const y = collisionPoint.y;

      // Check if fruit hits something (processed even for soft touches)
      this.checkFruitImpact(bodyA, bodyB, impactForce, x, y);

      if (impactForce < 8) return; // ignore soft touch for structural blocks and monkeys
      
      // Check structural damage (block hits block, block hits ground, fruit hits block)
      this.checkBlockImpact(bodyA, bodyB, impactForce, x, y);

      // Check monkey damage
      this.checkMonkeyImpact(bodyA, bodyB, impactForce, x, y);
    });
  }

  checkFruitImpact(bodyA, bodyB, force, x, y) {
    let fruitBody = null;
    let hitBody = null;

    if (bodyA.label === 'fruit') {
      fruitBody = bodyA;
      hitBody = bodyB;
    } else if (bodyB.label === 'fruit') {
      fruitBody = bodyB;
      hitBody = bodyA;
    }

    if (fruitBody && fruitBody.plugin.fruit) {
      const fruit = fruitBody.plugin.fruit;
      
      // Play impact audio and trail details
      fruit.onHit(force, hitBody.label);
      
      if (this.onFruitHit) {
        this.onFruitHit(fruit, hitBody, force, x, y);
      }
    }
  }

  checkBlockImpact(bodyA, bodyB, force, x, y) {
    if (bodyA.label === 'balloon' || bodyB.label === 'balloon') return;

    // Ignore settling damage during the first 1500ms
    const timeSinceStart = Date.now() - this.levelStartTime;
    if (timeSinceStart < 1500) {
      if (bodyA.label !== 'fruit' && bodyB.label !== 'fruit') {
        return;
      }
    }

    let damageFactor = 1.5;
    if (storage.getSelectedItem('trail') === 'fire') {
      damageFactor *= 1.15; // +15% damage
    }

    // Process block A
    if (bodyA.label === 'block' && bodyA.plugin.block) {
      const damage = force * damageFactor;
      bodyA.plugin.block.damage(damage, x, y);
      if (this.onBlockHit) this.onBlockHit(bodyA.plugin.block, force, x, y);
    }
    
    // Process block B
    if (bodyB.label === 'block' && bodyB.plugin.block) {
      const damage = force * damageFactor;
      bodyB.plugin.block.damage(damage, x, y);
      if (this.onBlockHit) this.onBlockHit(bodyB.plugin.block, force, x, y);
    }
  }

  checkMonkeyImpact(bodyA, bodyB, force, x, y) {
    if (bodyA.label === 'balloon' || bodyB.label === 'balloon') return;

    // Ignore settling damage during the first 2000ms
    const timeSinceStart = Date.now() - this.levelStartTime;
    if (timeSinceStart < 2000) {
      if (bodyA.label !== 'fruit' && bodyB.label !== 'fruit') {
        return;
      }
    }

    let damageFactor = 2.5; // monkeys are sensitive to impacts
    if (storage.getSelectedItem('trail') === 'fire') {
      damageFactor *= 1.15; // +15% damage
    }

    if (bodyA.label === 'monkey' && bodyA.plugin.monkey) {
      const damage = force * damageFactor;
      bodyA.plugin.monkey.damage(damage);
      if (this.onMonkeyHit) this.onMonkeyHit(bodyA.plugin.monkey, force, x, y);
    }

    if (bodyB.label === 'monkey' && bodyB.plugin.monkey) {
      const damage = force * damageFactor;
      bodyB.plugin.monkey.damage(damage);
      if (this.onMonkeyHit) this.onMonkeyHit(bodyB.plugin.monkey, force, x, y);
    }
  }
}

export const physics = new PhysicsSystem();
window.physics = physics;
