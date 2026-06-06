// Fruit Fling Main Game Controller

var Matter = window.Matter;

const DEFAULT_CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const SLINGSHOT_ANCHOR = { x: 180, y: 500 };
const FORK_L = { x: 165, y: 470 };
const FORK_R = { x: 195, y: 470 };

class GameController {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = DEFAULT_CANVAS_WIDTH;
    
    // Game States
    this.state = 'MENU'; // MENU, WORLD_SELECT, LEVEL_SELECT, PLAYING, SHOP, SETTINGS, PAUSED, VICTORY, DEFEAT
    this.currentWorldIndex = 0;
    this.currentLevelIndex = 0;
    
    // Play state variables
    this.levelScore = 0;
    this.fruitsQueue = [];
    this.activeFruit = null;
    this.fruitsOnField = []; // includes split mini-melons
    this.monkeysOnField = [];
    this.blocksOnField = [];
    
    // Camera
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.maxCameraScroll = 2400 - this.canvasWidth;
    
    // Slingshot drag
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.maxDragRadius = 80;
    
    // Settling/turn management
    this.activeFruitSettleTimer = 0;
    this.turnEnding = false;
    this.turnEndDelay = 120; // frames to wait after fruit stops
    
    // Background procedurals
    this.bgDecorations = [];
    
    // Frame timing
    this.lastTime = 0;
  }

  init() {
    // 1. Core Systems init
    physics.init();
    particles.reset();
    audio.startMusic();

    // 2. DOM Elements binding
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.bindEvents();
    this.updateHUD();
    this.createBackgroundDecorations();
    
    // Set physics callbacks
    physics.onBlockHit = (block, force) => {
      let scoreAdd = Math.round(force * 0.2);
      if (storage.getSelectedItem('trail') === 'rainbow') {
        scoreAdd = Math.round(scoreAdd * 1.10); // +10% score
      }
      this.levelScore += scoreAdd;
      this.updateHUD();
    };

    physics.onMonkeyHit = (monkey, force) => {
      let scoreAdd = Math.round(force * 0.5);
      if (storage.getSelectedItem('trail') === 'rainbow') {
        scoreAdd = Math.round(scoreAdd * 1.10);
      }
      this.levelScore += scoreAdd;
      this.updateHUD();
    };

    physics.onBlockDestroyed = (block) => {
      let scoreAdd = block.material.scoreValue;
      if (storage.getSelectedItem('trail') === 'rainbow') {
        scoreAdd = Math.round(scoreAdd * 1.10);
      }
      this.levelScore += scoreAdd;
      this.updateHUD();
    };

    physics.onMonkeyKilled = (monkey) => {
      let scoreAdd = monkey.scoreValue;
      if (storage.getSelectedItem('trail') === 'rainbow') {
        scoreAdd = Math.round(scoreAdd * 1.10);
      }
      this.levelScore += scoreAdd;
      this.updateHUD();
    };

    // Auto viewport resizing
    const resizeViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Keep logical height 720, calculate logical width adaptively
      this.canvasWidth = Math.round(CANVAS_HEIGHT * (w / h));
      this.canvasWidth = Math.max(1280, Math.min(this.canvasWidth, 2200));
      
      this.canvas.width = this.canvasWidth;
      this.canvas.height = CANVAS_HEIGHT;
      this.maxCameraScroll = 2400 - this.canvasWidth;
    };
    window.addEventListener('resize', resizeViewport);
    resizeViewport();

    // 3. Start Game loop
    requestAnimationFrame((t) => this.loop(t));
  }

  // --- BACKGROUND GENERATORS (Procedural Parallax Graphics) ---
  createBackgroundDecorations() {
    this.bgDecorations = [];
    
    // Generate static trees/hills/rocks coordinates for parallax layers
    for (let i = 0; i < 20; i++) {
      // Distant Layer (parallax 0.15)
      this.bgDecorations.push({
        layer: 1,
        x: i * 180 + Math.random() * 80,
        y: 350 + Math.random() * 100,
        w: 120 + Math.random() * 80,
        h: 200 + Math.random() * 120,
        color: `hsl(${120 + Math.random() * 10}, 20%, ${20 + Math.random() * 10}%)` // dull greens
      });
      
      // Midground Layer (parallax 0.4)
      this.bgDecorations.push({
        layer: 2,
        x: i * 260 + Math.random() * 100,
        y: 450 + Math.random() * 80,
        w: 60 + Math.random() * 40,
        h: 120 + Math.random() * 80,
        color: `hsl(${100 + Math.random() * 20}, 30%, ${25 + Math.random() * 12}%)` // mid greens
      });
    }
  }

  // --- STATE SWITCHES ---
  changeState(newState) {
    this.state = newState;
    audio.updateVolumes();

    // Show/Hide overlays
    const screens = ['menu-screen', 'world-select-screen', 'level-select-screen', 'shop-screen', 'settings-screen', 'pause-screen', 'victory-screen', 'defeat-screen'];
    screens.forEach(s => document.getElementById(s).classList.remove('active'));
    document.getElementById('gameplay-hud').classList.add('hidden');

    switch (this.state) {
      case 'MENU':
        document.getElementById('menu-screen').classList.add('active');
        audio.startMusic();
        break;
      case 'WORLD_SELECT':
        this.renderWorldsList();
        document.getElementById('world-select-screen').classList.add('active');
        break;
      case 'LEVEL_SELECT':
        this.renderLevelsList();
        document.getElementById('level-select-screen').classList.add('active');
        break;
      case 'SHOP':
        this.renderShop();
        document.getElementById('shop-screen').classList.add('active');
        break;
      case 'SETTINGS':
        document.getElementById('settings-screen').classList.add('active');
        break;
      case 'PAUSED':
        document.getElementById('pause-screen').classList.add('active');
        break;
      case 'PLAYING':
        document.getElementById('gameplay-hud').classList.remove('hidden');
        audio.setWorldMusicScale(WORLDS[this.currentWorldIndex].id);
        audio.startMusic();
        break;
      case 'VICTORY':
        this.showVictoryScreen();
        document.getElementById('victory-screen').classList.add('active');
        break;
      case 'DEFEAT':
        this.showDefeatScreen();
        document.getElementById('defeat-screen').classList.add('active');
        break;
    }
  }

  // --- UI RENDER DYNAMICS ---
  renderWorldsList() {
    const container = document.getElementById('worlds-container');
    container.innerHTML = '';
    
    WORLDS.forEach((world, index) => {
      const isUnlocked = index === 0 || storage.isWorldUnlocked(world.id);
      const card = document.createElement('div');
      card.className = `world-card world-${index + 1} ${isUnlocked ? '' : 'locked'}`;
      
      let starsEarned = 0;
      let totalStars = world.levels.length * 3;
      world.levels.forEach(lvl => {
        starsEarned += storage.getLevelStars(lvl.id);
      });

      card.innerHTML = `
        <div class="world-title">${world.name}</div>
        <div class="world-stats">${isUnlocked ? `Stars: ⭐️ ${starsEarned}/${totalStars}` : 'Locked'}</div>
        ${isUnlocked ? '' : '<div class="world-lock-icon">🔒</div>'}
      `;
      
      if (isUnlocked) {
        card.onclick = () => {
          this.currentWorldIndex = index;
          audio.playSfx('click');
          this.changeState('LEVEL_SELECT');
        };
      }
      container.appendChild(card);
    });
  }

  renderLevelsList() {
    const world = WORLDS[this.currentWorldIndex];
    document.getElementById('world-title-display').innerText = world.name;
    
    const container = document.getElementById('levels-container');
    container.innerHTML = '';
    
    world.levels.forEach((lvl, index) => {
      // Unlocked if first level or if previous level has stars > 0
      let isUnlocked = index === 0;
      if (index > 0) {
        const prevLvlId = world.levels[index - 1].id;
        isUnlocked = storage.getLevelStars(prevLvlId) > 0;
      }
      
      const btn = document.createElement('button');
      btn.className = `level-btn ${isUnlocked ? '' : 'locked'}`;
      
      const stars = storage.getLevelStars(lvl.id);
      let starsStr = '';
      for (let i = 0; i < 3; i++) {
        starsStr += `<span class="${i < stars ? 'star-active' : ''}">★</span>`;
      }

      btn.innerHTML = `
        <span class="level-num">${index + 1}</span>
        <div class="level-stars">${isUnlocked ? starsStr : '🔒'}</div>
      `;
      
      if (isUnlocked) {
        btn.onclick = () => {
          this.currentLevelIndex = index;
          audio.playSfx('click');
          this.startLevel();
        };
      }
      container.appendChild(btn);
    });
  }

  renderShop(category = 'trail') {
    // Sync coins count in shop header
    document.getElementById('shop-coins-val').innerText = storage.getCoins();

    const container = document.getElementById('shop-items-container');
    container.innerHTML = '';
    
    const catalog = shop.getCatalog();
    const items = catalog[category] || [];

    // Set active tab styling
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(t => {
      if (t.getAttribute('data-category') === category) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      
      let previewText = '✨';
      if (category === 'trail') {
        if (item.id === 'classic') previewText = '💨';
        if (item.id === 'rainbow') previewText = '🌈';
        if (item.id === 'fire') previewText = '🔥';
        if (item.id === 'sparkle') previewText = '⭐';
        if (item.id === 'bubble') previewText = '🫧';
      } else if (category === 'slingshot') {
        if (item.id === 'classic') previewText = '🪓';
        if (item.id === 'golden') previewText = '🔱';
        if (item.id === 'laser') previewText = '🚀';
        if (item.id === 'bubble') previewText = '🐚';
      } else if (category === 'fruitSkin') {
        previewText = item.id === 'classic' ? '🍎' : '👑';
      }

      let btnClass = 'buy';
      let btnLabel = `🪙 ${item.cost}`;
      
      if (item.isUnlocked) {
        if (item.isSelected) {
          btnClass = 'equipped';
          btnLabel = 'Equipped';
        } else {
          btnClass = 'equip';
          btnLabel = 'Equip';
        }
      }

      card.innerHTML = `
        <div>
          <div class="shop-item-preview">${previewText}</div>
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.desc}</div>
        </div>
        <button class="shop-buy-btn ${btnClass}" id="shop-btn-${item.id}">${btnLabel}</button>
      `;

      const btn = card.querySelector(`#shop-btn-${item.id}`);
      btn.onclick = () => {
        const res = shop.buyItem(category, item.id);
        if (res.success) {
          this.renderShop(category);
        } else {
          // shake/failed visual or text float inside canvas
          alert(res.message);
        }
      };

      container.appendChild(card);
    });
  }

  showVictoryScreen() {
    const lvl = WORLDS[this.currentWorldIndex].levels[this.currentLevelIndex];
    
    // Calculate stars based on the least amount of fruits used to clear the level
    const totalFruits = lvl.fruits.length;
    const fruitsLeft = this.fruitsQueue.length + (this.activeFruit && !this.activeFruit.isLaunched ? 1 : 0);
    const fruitsUsed = totalFruits - fruitsLeft;

    let stars = 1;
    if (fruitsUsed === 1) {
      stars = 3;
    } else {
      const ratio = fruitsLeft / totalFruits;
      if (ratio >= 0.5) {
        stars = 3;
      } else if (ratio > 0) {
        stars = 2;
      } else {
        stars = 1;
      }
    }

    // Calculate coins award: stars * 10 * worldNumber
    const worldNum = this.currentWorldIndex + 1; // 1-based
    let coinsEarned = stars * 10 * worldNum;
    if (storage.getSelectedItem('trail') === 'rainbow') {
      coinsEarned = Math.round(coinsEarned * 1.10); // +10% coins
    }

    // Save progress & award coins
    storage.completeLevel(lvl.id, stars, this.levelScore);
    storage.addCoins(coinsEarned);
    
    // Check if we unlock the next world
    // If we completed level 3 of world 1, unlock world 2
    if (this.currentLevelIndex === 2) {
      const nextWorldNum = this.currentWorldIndex + 2; // e.g. from index 0 (World 1) to World 2
      if (nextWorldNum <= WORLDS.length) {
        storage.unlockWorld(`world_${nextWorldNum}`);
      }
    }

    // Set labels
    const vCoinsEarned = document.getElementById('v-coins-val');
    if (vCoinsEarned) vCoinsEarned.innerText = `+${coinsEarned}`;
    const vTotalCoins = document.getElementById('v-total-coins-val');
    if (vTotalCoins) vTotalCoins.innerText = storage.getCoins();

    // Play jingle
    audio.playSfx('victory');

    // Trigger star pop-up animations in DOM
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`v-star-${i}`);
      el.classList.remove('active');
      if (i <= stars) {
        setTimeout(() => {
          el.classList.add('active');
          audio.playSfx('click');
        }, i * 350);
      }
    }

    // Next button visibility
    const isLastLevelOfWorld = this.currentLevelIndex === WORLDS[this.currentWorldIndex].levels.length - 1;
    const isLastWorld = this.currentWorldIndex === WORLDS.length - 1;
    const nextBtn = document.getElementById('v-next-btn');

    if (isLastLevelOfWorld && isLastWorld) {
      nextBtn.style.display = 'none'; // beat the game!
    } else {
      nextBtn.style.display = 'block';
    }
  }

  showDefeatScreen() {
    const lvl = WORLDS[this.currentWorldIndex].levels[this.currentLevelIndex];
    
    const dCoins = document.getElementById('d-coins-val');
    if (dCoins) dCoins.innerText = storage.getCoins();
    
    audio.playSfx('defeat');
  }

  // --- GAMEPLAY INITIALIZATION ---
  startLevel() {
    physics.clear();
    particles.reset();
    
    const world = WORLDS[this.currentWorldIndex];
    const lvl = world.levels[this.currentLevelIndex];
    
    // Setup physics details
    physics.setGravity(world.gravity);

    // Setup fields
    this.levelScore = 0;
    this.fruitsQueue = [...lvl.fruits];
    this.activeFruit = null;
    this.fruitsOnField = [];
    this.monkeysOnField = [];
    this.blocksOnField = [];
    
    // Set scrolling boundaries
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.isDragging = false;
    this.activeFruitSettleTimer = 0;
    this.turnEnding = false;

    // 1. Build structures
    lvl.blocks.forEach(b => {
      const block = new StructureBlock(b.x, b.y, b.w, b.h, b.shape, b.material, b.angle);
      physics.addBlockBody(block);
      this.blocksOnField.push(block);
    });

    // 2. Spawn Monkeys
    lvl.monkeys.forEach(m => {
      const monkey = new Monkey(m.x, m.y, m.type);
      physics.addMonkeyBody(monkey);
      
      // If balloon monkey, configure joint constraint
      if (m.type === 'balloon') {
        monkey.setupBalloon(physics.engine.world);
      }

      this.monkeysOnField.push(monkey);
    });

    // 3. Setup first fruit in slingshot queue
    this.loadNextFruit();
    
    // 4. Update HUD layout labels
    document.getElementById('hud-level-name').innerText = `${world.name} - Lvl ${this.currentLevelIndex + 1}`;
    this.updateHUD();

    // Show tutorial on Level 1 of World 1
    const tutorialPanel = document.getElementById('tutorial-panel');
    if (this.currentWorldIndex === 0 && this.currentLevelIndex === 0) {
      if (tutorialPanel) {
        tutorialPanel.classList.remove('hidden');
      }
    } else {
      if (tutorialPanel) {
        tutorialPanel.classList.add('hidden');
      }
    }

    this.changeState('PLAYING');
  }

  loadNextFruit() {
    if (this.fruitsQueue.length === 0) {
      this.activeFruit = null;
      return;
    }

    const type = this.fruitsQueue.shift();
    
    // Create new fruit body at slingshot anchor
    const fruit = new Fruit(SLINGSHOT_ANCHOR.x, SLINGSHOT_ANCHOR.y, type);
    
    // Add to physics world but make it static initially (while loading/dragging)
    const body = physics.addFruitBody(fruit);
    Matter.Body.setStatic(body, true);
    
    this.activeFruit = fruit;
    this.fruitsOnField.push(fruit);

    // Refresh UI slingshot queue indicators
    this.renderFruitQueue();
    
    // Reset camera to slingshot
    this.targetCameraX = 0;
  }

  spawnTemporaryBlock(x, y, w, h, angle, materialType) {
    const block = new StructureBlock(x, y, w, h, 'box', materialType, angle);
    block.isTemp = true;
    physics.addBlockBody(block);
    
    // Make builder shield disappear/decay slowly after 6 seconds (360 frames)
    block.tempLife = 360;
    this.blocksOnField.push(block);
    return block;
  }

  // --- BUTTON CLICKS / BINDINGS ---
  bindEvents() {
    // Menu screen
    document.getElementById('play-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('WORLD_SELECT');
    };
    document.getElementById('shop-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('SHOP');
    };
    document.getElementById('settings-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('SETTINGS');
    };

    // Back buttons
    document.getElementById('world-back-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('MENU');
    };
    document.getElementById('level-back-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('WORLD_SELECT');
    };
    document.getElementById('shop-back-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('MENU');
    };
    
    // Settings screen controls
    const sVol = document.getElementById('sound-volume');
    const mVol = document.getElementById('music-volume');
    const shakeCh = document.getElementById('shake-toggle');

    // Init values
    sVol.value = storage.getSetting('soundVolume');
    mVol.value = storage.getSetting('musicVolume');
    shakeCh.checked = storage.getSetting('screenShake');

    sVol.oninput = () => {
      storage.setSetting('soundVolume', parseFloat(sVol.value));
      audio.updateVolumes();
    };
    mVol.oninput = () => {
      storage.setSetting('musicVolume', parseFloat(mVol.value));
      audio.updateVolumes();
    };
    shakeCh.onchange = () => {
      storage.setSetting('screenShake', shakeCh.checked);
    };

    document.getElementById('settings-back-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('MENU');
    };

    // HUD buttons
    document.getElementById('hud-restart-btn').onclick = () => {
      audio.playSfx('click');
      this.startLevel();
    };
    document.getElementById('hud-pause-btn').onclick = () => {
      audio.playSfx('click');
      // Sync pause volumes
      document.getElementById('pause-sound-volume').value = storage.getSetting('soundVolume');
      document.getElementById('pause-music-volume').value = storage.getSetting('musicVolume');
      this.changeState('PAUSED');
    };

    // Pause panel settings sliders
    const psVol = document.getElementById('pause-sound-volume');
    const pmVol = document.getElementById('pause-music-volume');
    psVol.oninput = () => {
      storage.setSetting('soundVolume', parseFloat(psVol.value));
      audio.updateVolumes();
    };
    pmVol.oninput = () => {
      storage.setSetting('musicVolume', parseFloat(pmVol.value));
      audio.updateVolumes();
    };

    // Pause panel buttons
    document.getElementById('pause-resume-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('PLAYING');
    };
    document.getElementById('pause-restart-btn').onclick = () => {
      audio.playSfx('click');
      this.startLevel();
    };
    document.getElementById('pause-levels-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('LEVEL_SELECT');
    };
    document.getElementById('pause-menu-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('MENU');
    };

    // Shop Catalog Tabs switching
    const shopTabs = document.querySelectorAll('.shop-tab');
    shopTabs.forEach(tab => {
      tab.onclick = () => {
        audio.playSfx('click');
        const cat = tab.getAttribute('data-category');
        this.renderShop(cat);
      };
    });

    // Dialogs victory/defeat
    document.getElementById('v-levels-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('LEVEL_SELECT');
    };
    document.getElementById('v-replay-btn').onclick = () => {
      audio.playSfx('click');
      this.startLevel();
    };
    document.getElementById('v-next-btn').onclick = () => {
      audio.playSfx('click');
      // Go to next level
      const world = WORLDS[this.currentWorldIndex];
      if (this.currentLevelIndex < world.levels.length - 1) {
        this.currentLevelIndex++;
        this.startLevel();
      } else {
        // Next World select
        if (this.currentWorldIndex < WORLDS.length - 1) {
          this.currentWorldIndex++;
          this.currentLevelIndex = 0;
          this.startLevel();
        }
      }
    };

    document.getElementById('d-levels-btn').onclick = () => {
      audio.playSfx('click');
      this.changeState('LEVEL_SELECT');
    };
    document.getElementById('d-replay-btn').onclick = () => {
      audio.playSfx('click');
      this.startLevel();
    };

    // Special Ability triggers
    document.getElementById('ability-trigger-btn').onclick = (e) => {
      e.stopPropagation(); // prevent screen click double triggers
      this.triggerActiveFruitAbility();
    };
    
    // Slingshot drag binding (Mouse / Touch)
    this.canvas.addEventListener('mousedown', (e) => this.handleDragStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleDragMove(e));
    window.addEventListener('mouseup', (e) => this.handleDragEnd(e));

    this.canvas.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.handleDragEnd(e));

    // Tutorial Got It button binding
    const tutClose = document.getElementById('tutorial-close-btn');
    if (tutClose) {
      tutClose.onclick = () => {
        audio.playSfx('click');
        document.getElementById('tutorial-panel').classList.add('hidden');
      };
    }

    // World select left/right scroll buttons
    const worldsContainer = document.getElementById('worlds-container');
    const btnScrollLeft = document.getElementById('worlds-scroll-left');
    const btnScrollRight = document.getElementById('worlds-scroll-right');
    if (btnScrollLeft && btnScrollRight && worldsContainer) {
      btnScrollLeft.onclick = () => {
        audio.playSfx('click');
        worldsContainer.scrollBy({ left: -270, behavior: 'smooth' });
      };
      btnScrollRight.onclick = () => {
        audio.playSfx('click');
        worldsContainer.scrollBy({ left: 270, behavior: 'smooth' });
      };
    }

    // Fullscreen button bindings
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.onclick = () => {
        audio.playSfx('click');
        this.toggleFullscreen();
      };
    }

    // Fullscreen change events
    const fsEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    fsEvents.forEach(evt => {
      document.addEventListener(evt, () => {
        this.updateFullscreenButton();
      });
    });
  }

  toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullScreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;
    const cancelFullScreen =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    const fullscreenElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!fullscreenElement) {
      if (requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (cancelFullScreen) {
        cancelFullScreen.call(doc);
      }
    }
  }

  updateFullscreenButton() {
    const doc = window.document;
    const fullscreenElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    const btn = document.getElementById('fullscreen-btn');
    if (!btn) return;

    if (fullscreenElement) {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
        </svg>
      `;
      btn.setAttribute('title', 'Exit Fullscreen');
    } else {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      `;
      btn.setAttribute('title', 'Enter Fullscreen');
    }
  }

  // --- DRAG INPUTS GESTURE RESOLUTION ---
  getMousePosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    
    // Extract Client Coordinates (unified support mouse and touch)
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale mouse point back to canvas 1280x720 coordinates
    const scaleX = this.canvasWidth / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX + this.cameraX, // factor scroll position
      y: (clientY - rect.top) * scaleY
    };
  }

  handleDragStart(e) {
    if (this.state !== 'PLAYING') return;
    if (!this.activeFruit || this.activeFruit.isLaunched) {
      // If fruit is launched, let them click anywhere on screen to trigger ability!
      if (this.activeFruit && !this.activeFruit.hasUsedAbility) {
        this.triggerActiveFruitAbility();
      }
      return;
    }

    const mousePos = this.getMousePosition(e);
    const distToFruit = Matter.Vector.magnitude(Matter.Vector.sub(mousePos, SLINGSHOT_ANCHOR));

    // Can start drag if mouse clicks near slingshot anchor (< 90 pixels)
    if (distToFruit < 90) {
      e.preventDefault();
      this.isDragging = true;
      audio.playSfx('stretch');
    }
  }

  getMaxDragRadius() {
    const trail = storage.getSelectedItem('trail');
    if (trail === 'sparkle') {
      return 92; // +15% more pull distance
    }
    return 80;
  }

  handleDragMove(e) {
    if (!this.isDragging || !this.activeFruit) return;
    e.preventDefault();

    const mousePos = this.getMousePosition(e);
    
    // Calculate drag offset vector from anchor
    const offset = Matter.Vector.sub(mousePos, SLINGSHOT_ANCHOR);
    const dist = Matter.Vector.magnitude(offset);

    // Clamp drag distance to maximum elastic radius
    const maxRadius = this.getMaxDragRadius();
    if (dist > maxRadius) {
      const dir = Matter.Vector.normalise(offset);
      this.dragOffset = Matter.Vector.mult(dir, maxRadius);
    } else {
      this.dragOffset = offset;
    }

    // Position fruit body in physics world
    const fx = SLINGSHOT_ANCHOR.x + this.dragOffset.x;
    const fy = SLINGSHOT_ANCHOR.y + this.dragOffset.y;
    Matter.Body.setPosition(this.activeFruit.body, { x: fx, y: fy });

    // Periodic stretch noise when dragging
    if (Math.round(dist) % 20 === 0 && Math.random() < 0.25) {
      audio.playSfx('stretch');
    }
  }

  handleDragEnd(e) {
    if (!this.isDragging || !this.activeFruit) return;
    this.isDragging = false;

    // Compute release launch force (acts like an opposite rubber elastic pull)
    const dist = Matter.Vector.magnitude(this.dragOffset);

    // Ignore launch if drag offset is extremely small
    if (dist < 10) {
      // Snap fruit back to center anchor
      Matter.Body.setPosition(this.activeFruit.body, SLINGSHOT_ANCHOR);
      this.dragOffset = { x: 0, y: 0 };
      return;
    }

    // Launch speed scale factor (higher stretch = faster speed)
    // 0.15 matches the viewport dimensions nicely
    const buffs = this.getSlingshotBuffs();
    const vx = -this.dragOffset.x * buffs.powerScale;
    const vy = -this.dragOffset.y * buffs.powerScale;

    // Fire fruit
    this.activeFruit.launch({ x: vx, y: vy });

    // Start camera tracking immediately
    this.targetCameraX = this.activeFruit.body.position.x - 300;

    // Reset offset
    this.dragOffset = { x: 0, y: 0 };
  }

  getSlingshotBuffs() {
    let powerScale = 0.235;
    let gravityScale = 1.0;
    
    const skin = storage.getSelectedItem('slingshot');
    if (skin === 'golden') {
      powerScale *= 1.15; // +15% launch speed
    } else if (skin === 'laser') {
      powerScale *= 1.25; // +25% launch speed
    } else if (skin === 'bubble') {
      powerScale *= 1.10; // +10% launch speed
      gravityScale = 0.80; // -20% gravity
    }
    
    return { powerScale, gravityScale };
  }

  triggerActiveFruitAbility() {
    if (this.activeFruit && this.activeFruit.isLaunched && !this.activeFruit.hasUsedAbility) {
      this.activeFruit.triggerAbility(this);
      
      // Hide ability button after trigger
      document.getElementById('ability-overlay').classList.add('hidden');
    }
  }

  // --- STATS HUD UPDATERS ---
  updateHUD() {
    // Double bind coin counts in HUD and Shop
    const coins = storage.getCoins();
    const coinsVal = document.getElementById('coins-val');
    if (coinsVal) {
      coinsVal.innerText = coins;
    }
    const shopCoinsLabel = document.getElementById('shop-coins-val');
    if (shopCoinsLabel) {
      shopCoinsLabel.innerText = coins;
    }
  }

  swapActiveFruit(queueIndex) {
    if (!this.activeFruit || this.activeFruit.isLaunched) return;
    
    // Play SFX
    audio.playSfx('click');
    
    // Remove the current active fruit body from physics world and fruitsOnField
    physics.removeBody(this.activeFruit.body);
    this.fruitsOnField = this.fruitsOnField.filter(f => f !== this.activeFruit);
    
    // Swap the types
    const currentType = this.activeFruit.type;
    const selectedType = this.fruitsQueue[queueIndex];
    this.fruitsQueue[queueIndex] = currentType;
    
    // Create new fruit body at slingshot anchor
    const fruit = new Fruit(SLINGSHOT_ANCHOR.x, SLINGSHOT_ANCHOR.y, selectedType);
    const body = physics.addFruitBody(fruit);
    Matter.Body.setStatic(body, true);
    
    this.activeFruit = fruit;
    this.fruitsOnField.push(fruit);
    
    // Re-render UI
    this.renderFruitQueue();
  }

  renderFruitQueue() {
    const queuePanel = document.getElementById('fruit-queue');
    queuePanel.innerHTML = '';

    // Show active fruit icon as primary
    if (this.activeFruit) {
      const activeIcon = document.createElement('div');
      activeIcon.className = 'queue-fruit-icon active';
      activeIcon.innerText = this.getFruitEmoji(this.activeFruit.type);
      queuePanel.appendChild(activeIcon);
    }

    // Show remaining in queue with click-to-swap triggers
    this.fruitsQueue.forEach((type, index) => {
      const icon = document.createElement('div');
      icon.className = 'queue-fruit-icon';
      icon.innerText = this.getFruitEmoji(type);
      
      if (this.activeFruit && !this.activeFruit.isLaunched) {
        icon.style.cursor = 'pointer';
        icon.title = 'Click to swap fruit';
        icon.onclick = () => this.swapActiveFruit(index);
      }
      
      queuePanel.appendChild(icon);
    });
  }

  getFruitEmoji(type) {
    switch (type) {
      case 'coconut': return '🥥';
      case 'banana': return '🍌';
      case 'strawberry': return '🍓';
      case 'watermelon': return '🍉';
      case 'apple':
      default:
        return '🍎';
    }
  }

  // --- GAME UPDATE & LOOP ---
  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Execute state loops
    if (this.state === 'PLAYING') {
      this.updatePlayingState(dt);
      this.drawPlayingState();
    } else if (this.state === 'PAUSED' || this.state === 'VICTORY' || this.state === 'DEFEAT' || this.state === 'MENU' || this.state === 'WORLD_SELECT' || this.state === 'LEVEL_SELECT' || this.state === 'SHOP' || this.state === 'SETTINGS') {
      // Still draw background scenes on UI screens for aesthetic premium look
      this.drawUIScreensBackground();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  updatePlayingState(dt) {
    // 1. Step Matter.js physics
    physics.update(dt);
    
    // 2. Update all active fruits
    this.fruitsOnField.forEach(f => f.update());

    // 3. Update monkeys and check boundaries
    this.monkeysOnField.forEach(m => {
      m.update(this.fruitsOnField, this);
      if (m.body && (m.body.position.y > 750 || m.body.position.x < -200 || m.body.position.x > 2600)) {
        m.die();
      }
    });

    // 4. Update temporary builder shields and check block boundaries
    for (let i = this.blocksOnField.length - 1; i >= 0; i--) {
      const block = this.blocksOnField[i];
      if (block.isTemp) {
        block.tempLife--;
        if (block.tempLife <= 0) {
          block.destroy();
          continue;
        }
      }
      if (block.body && (block.body.position.y > 750 || block.body.position.x < -200 || block.body.position.x > 2600)) {
        block.destroy();
      }
    }

    // Filter dead elements on field
    this.fruitsOnField = this.fruitsOnField.filter(f => !f.isDead);
    this.monkeysOnField = this.monkeysOnField.filter(m => !m.isDead);
    this.blocksOnField = this.blocksOnField.filter(b => !b.isDead);

    // 5. Update particle system details
    particles.update();

    // 6. Camera smooth tracking
    if (this.activeFruit && this.activeFruit.isLaunched && !this.activeFruit.isDead) {
      const fpos = this.activeFruit.body.position;
      
      // Keep tracking fruit
      this.targetCameraX = fpos.x - 300;
    } else {
      // Zoom back to slingshot if no fruit is in flight
      this.targetCameraX = 0;
    }

    // Interpolate camera scroll positioning
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.08;
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.maxCameraScroll));

    // 7. Ability button HTML overlay updates
    const abilityOverlay = document.getElementById('ability-overlay');
    if (this.activeFruit && this.activeFruit.isLaunched && !this.activeFruit.hasUsedAbility && !this.activeFruit.isDead) {
      if (['banana', 'strawberry', 'watermelon', 'apple', 'coconut'].includes(this.activeFruit.type)) {
        abilityOverlay.classList.remove('hidden');
        document.getElementById('ability-trigger-btn').innerText = this.activeFruit.abilityText;
      }
    } else {
      abilityOverlay.classList.add('hidden');
    }

    // 8. Turn Ending & Win/Lose checks
    this.checkTurnManagement();
  }

  checkTurnManagement() {
    if (this.monkeysOnField.length === 0) {
      // Reclaim kingdom! WIN
      setTimeout(() => this.changeState('VICTORY'), 800);
      return;
    }

    // Check active fruit settling
    if (this.activeFruit && (this.activeFruit.isDead || !this.activeFruit.body)) {
      this.activeFruitSettleTimer = 0;
      this.activeFruit = null;
      if (this.fruitsQueue.length > 0) {
        setTimeout(() => this.loadNextFruit(), 400);
      } else {
        setTimeout(() => {
          const movingFruitsLeft = this.fruitsOnField.some(f => f.body && Matter.Vector.magnitude(f.body.velocity) > 0.4);
          if (!movingFruitsLeft && this.monkeysOnField.length > 0) {
            this.changeState('DEFEAT');
          }
        }, 1500);
      }
    } else if (this.activeFruit && this.activeFruit.isLaunched) {
      const fbody = this.activeFruit.body;
      const speed = Matter.Vector.magnitude(fbody.velocity);

      // Settle conditions:
      // Fruit fell off bottom floor, went past boundaries, or is basically static
      const offScreen = fbody.position.y > 675 || fbody.position.x > 2350 || fbody.position.x < -100;
      const stopped = speed < 0.28;

      if (offScreen || stopped) {
        this.activeFruitSettleTimer++;
      } else {
        this.activeFruitSettleTimer = 0;
      }

      // 120 frames (approx 2 seconds) of being settled = turn ends
      if (this.activeFruitSettleTimer > 120 || offScreen) {
        this.activeFruitSettleTimer = 0;
        
        // Remove active fruit
        this.activeFruit.destroy();
        this.activeFruit = null;
        
        // Load next fruit if available
        if (this.fruitsQueue.length > 0) {
          setTimeout(() => this.loadNextFruit(), 400);
        } else {
          // No fruits left in queue. Check if any mini split watermelons are still moving
          setTimeout(() => {
            const movingFruitsLeft = this.fruitsOnField.some(f => Matter.Vector.magnitude(f.body.velocity) > 0.4);
            if (!movingFruitsLeft && this.monkeysOnField.length > 0) {
              this.changeState('DEFEAT');
            }
          }, 1500);
        }
      }
    }
  }

  // --- CANVAS RENDERING CONTROLLERS ---
  drawPlayingState() {
    this.ctx.clearRect(0, 0, this.canvasWidth, CANVAS_HEIGHT);

    // Get shake translations
    const sx = particles.shakeX;
    const sy = particles.shakeY;

    this.ctx.save();
    // Offset drawing for camera scroll + screen shake
    this.ctx.translate(-this.cameraX + sx, sy);

    // 1. Draw Parallax Background layers
    this.drawParallaxBackground();

    // 2. Draw Slingshot Back Band
    this.drawSlingshotBand(true);

    // 3. Draw Ground
    this.drawGroundElements();

    // 4. Draw Structures
    this.blocksOnField.forEach(b => b.draw(this.ctx));

    // 5. Draw Monkeys
    this.monkeysOnField.forEach(m => m.draw(this.ctx));

    // 6. Draw Slingshot base and forks
    this.drawSlingshotForks();

    // 7. Draw Trajectory Dots (if dragging)
    this.drawLaunchTrajectory();

    // 8. Draw Active Fruits
    this.fruitsOnField.forEach(f => f.draw(this.ctx));

    // 9. Draw Slingshot Front Band (wraps over fruit)
    this.drawSlingshotBand(false);

    // 10. Draw Particle system
    particles.draw(this.ctx);

    this.ctx.restore();
  }

  drawUIScreensBackground() {
    // Draws a beautiful animated scrolling canvas view in background of menu screens
    this.ctx.clearRect(0, 0, this.canvasWidth, CANVAS_HEIGHT);
    
    // Slow drift scroll
    this.cameraX = (this.cameraX + 0.25) % this.maxCameraScroll;

    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    // Draw jungle background
    this.drawParallaxBackground();
    this.drawGroundElements();

    this.ctx.restore();
  }

  drawParallaxBackground() {
    const world = WORLDS[this.currentWorldIndex];
    const skyGrad = this.ctx.createLinearGradient(this.cameraX, 0, this.cameraX, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, world.bgColors[0]);
    skyGrad.addColorStop(1, world.bgColors[1]);
    
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(this.cameraX, 0, this.canvasWidth, CANVAS_HEIGHT);

    // Draw parallax layer 1: Distant silhouetted hills/hills/nebulas
    this.bgDecorations.forEach(dec => {
      if (dec.layer === 1) {
        this.ctx.fillStyle = dec.color;
        // Draw organic hump
        this.ctx.beginPath();
        const px = dec.x + this.cameraX * 0.85; // moves slow
        this.ctx.arc(px, dec.y, dec.w, Math.PI, 0);
        this.ctx.fill();
      }
    });

    // Draw parallax layer 2: Midground
    this.bgDecorations.forEach(dec => {
      if (dec.layer === 2) {
        this.ctx.fillStyle = dec.color;
        this.ctx.beginPath();
        const px = dec.x + this.cameraX * 0.6; // moves medium
        
        // Draw triangular tree or building silhouette depending on world
        if (this.currentWorldIndex === 4) {
          // City skyscrapers
          this.ctx.fillRect(px - dec.w/2, dec.y - 100, dec.w, 400);
        } else {
          // Tree cones
          this.ctx.moveTo(px, dec.y - dec.h);
          this.ctx.lineTo(px - dec.w, dec.y);
          this.ctx.lineTo(px + dec.w, dec.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
    });
  }

  drawGroundElements() {
    const worldId = WORLDS[this.currentWorldIndex].id;
    const thickness = 70;
    const gy = CANVAS_HEIGHT - thickness;

    this.ctx.save();
    
    // Choose ground color based on World theme
    let gColor = '#3a5f0b'; // jungle grass green
    let dirtColor = '#5c3a21'; // jungle mud brown
    
    if (worldId === 'world_2') {
      gColor = '#eedc82'; // beach sand gold
      dirtColor = '#cca352'; // wet sand
    } else if (worldId === 'world_3') {
      gColor = '#778899'; // ancient temple stone slate
      dirtColor = '#4f5d73';
    } else if (worldId === 'world_4') {
      gColor = '#3a0c0c'; // magma volcanic crust
      dirtColor = '#1f0000';
    } else if (worldId === 'world_5') {
      gColor = '#100c28'; // futuristic cyber street
      dirtColor = '#05030e';
    } else if (worldId === 'world_6') {
      gColor = '#3d315b'; // space asteroids rock surface
      dirtColor = '#241b35';
    } else if (worldId === 'world_7') {
      gColor = '#00ffcc'; // cyber neon cyan
      dirtColor = '#0d0c1d'; // cyber dark background
    } else if (worldId === 'world_8') {
      gColor = '#ffffff'; // glacier snow white
      dirtColor = '#80deea'; // ice cyan
    } else if (worldId === 'world_9') {
      gColor = '#ffd700'; // golden palace shiny gold
      dirtColor = '#4a0e4e'; // royal purple
    }

    // Dirt base
    this.ctx.fillStyle = dirtColor;
    this.ctx.fillRect(0, gy, 2400, thickness);

    // Top grass crust
    this.ctx.fillStyle = gColor;
    this.ctx.fillRect(0, gy, 2400, 16);

    // Add visual details on grass top edge (e.g. grass peaks)
    this.ctx.strokeStyle = gColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    
    if (worldId === 'world_1' || worldId === 'world_2') {
      // Grass/sand waves peaks
      for (let i = 0; i < 2400; i += 12) {
        this.ctx.moveTo(i, gy + 16);
        this.ctx.lineTo(i + 6, gy + 8 + Math.sin(i / 15) * 4);
      }
      this.ctx.stroke();
    } else if (worldId === 'world_4') {
      // Draw lava glowing cracks
      this.ctx.strokeStyle = '#ff3300';
      this.ctx.lineWidth = 1.5;
      for (let i = 0; i < 2400; i += 60) {
        if (Math.random() < 0.4) {
          this.ctx.beginPath();
          this.ctx.moveTo(i, gy + 20);
          this.ctx.lineTo(i + 15 + Math.random()*15, gy + thickness - 10);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.restore();
  }

  drawSlingshotForks() {
    this.ctx.save();
    
    // Choose slingshot colors based on equipped skins
    const skin = storage.getSelectedItem('slingshot');
    
    let baseColor = '#8b5a2b'; // dark wood
    let forkColor = '#cd853f'; // light wood Peru
    let cupColor = '#4a2500';

    if (skin === 'golden') {
      baseColor = '#b8860b'; // golden metal
      forkColor = '#ffd700'; // shiny gold
      cupColor = '#e6b800';
    } else if (skin === 'laser') {
      baseColor = '#0077ff'; // neon cyber blue
      forkColor = '#00ffff'; // glowing cyan
      cupColor = '#00d2ff';
    } else if (skin === 'bubble') {
      baseColor = '#ff69b4'; // hot coral pink
      forkColor = '#ffb6c1';
      cupColor = '#ffc0cb';
    }

    this.ctx.strokeStyle = '#1e110a';
    this.ctx.lineWidth = 3.5;

    // Draw main vertical stand post
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(SLINGSHOT_ANCHOR.x - 7, SLINGSHOT_ANCHOR.y, 14, 160);
    this.ctx.strokeRect(SLINGSHOT_ANCHOR.x - 7, SLINGSHOT_ANCHOR.y, 14, 160);

    // Left Fork arm
    this.ctx.fillStyle = forkColor;
    this.ctx.beginPath();
    this.ctx.moveTo(SLINGSHOT_ANCHOR.x - 7, SLINGSHOT_ANCHOR.y + 15);
    this.ctx.lineTo(FORK_L.x - 4, FORK_L.y);
    this.ctx.lineTo(FORK_L.x + 8, FORK_L.y);
    this.ctx.lineTo(SLINGSHOT_ANCHOR.x + 3, SLINGSHOT_ANCHOR.y + 25);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Right Fork arm
    this.ctx.beginPath();
    this.ctx.moveTo(SLINGSHOT_ANCHOR.x + 7, SLINGSHOT_ANCHOR.y + 15);
    this.ctx.lineTo(FORK_R.x + 4, FORK_R.y);
    this.ctx.lineTo(FORK_R.x - 8, FORK_R.y);
    this.ctx.lineTo(SLINGSHOT_ANCHOR.x - 3, SLINGSHOT_ANCHOR.y + 25);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Fork cups
    this.ctx.fillStyle = cupColor;
    this.ctx.beginPath();
    this.ctx.arc(FORK_L.x, FORK_L.y, 6, 0, Math.PI * 2);
    this.ctx.arc(FORK_R.x, FORK_R.y, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawSlingshotBand(isBack) {
    if (!this.activeFruit || !this.activeFruit.body || this.activeFruit.isDead) return;

    // Determine dragging positions
    const fx = this.activeFruit.body.position.x;
    const fy = this.activeFruit.body.position.y;
    const r = this.activeFruit.radius;

    // If fruit has been fired, slingshot bands snap back to resting position
    const isLaunched = this.activeFruit.isLaunched;
    const targetX = isLaunched ? SLINGSHOT_ANCHOR.x : fx;
    const targetY = isLaunched ? SLINGSHOT_ANCHOR.y : fy;

    this.ctx.save();
    
    // Slingshot leather band thickness narrows when stretched
    const stretchDistance = Matter.Vector.magnitude(this.dragOffset);
    const bandWidth = Math.max(2, 6 - stretchDistance * 0.04);
    
    // Color of band
    const skin = storage.getSelectedItem('slingshot');
    this.ctx.strokeStyle = skin === 'golden' ? '#e6b800' : (skin === 'laser' ? '#00ffff' : '#8b2500');
    this.ctx.lineWidth = bandWidth;
    this.ctx.lineCap = 'round';

    if (isBack) {
      // Connect Right Fork to fruit cup back center
      this.ctx.beginPath();
      this.ctx.moveTo(FORK_R.x, FORK_R.y);
      this.ctx.lineTo(targetX + r * 0.2, targetY);
      this.ctx.stroke();
    } else {
      // Connect Left Fork to fruit cup front center (layer over the fruit face)
      if (!isLaunched) {
        // Draw pocket cup leather patch
        this.ctx.fillStyle = '#4a1500';
        this.ctx.strokeStyle = '#222222';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.ellipse(targetX, targetY, r * 0.9, r * 1.1, Math.atan2(this.dragOffset.y, this.dragOffset.x), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      }

      this.ctx.strokeStyle = skin === 'golden' ? '#ffd700' : (skin === 'laser' ? '#00ffff' : '#a0522d');
      this.ctx.lineWidth = bandWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(FORK_L.x, FORK_L.y);
      this.ctx.lineTo(targetX - r * 0.2, targetY);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawLaunchTrajectory() {
    if (!this.isDragging || !this.activeFruit) return;

    const buffs = this.getSlingshotBuffs();
    const gravity = WORLDS[this.currentWorldIndex].gravity * 0.001 * buffs.gravityScale; // Matter scale gravity force
    const startX = SLINGSHOT_ANCHOR.x + this.dragOffset.x;
    const startY = SLINGSHOT_ANCHOR.y + this.dragOffset.y;
    
    const vx = -this.dragOffset.x * buffs.powerScale;
    const vy = -this.dragOffset.y * buffs.powerScale;

    this.ctx.save();

    const skin = storage.getSelectedItem('slingshot');
    const isLaser = skin === 'golden' || skin === 'laser';

    if (isLaser) {
      // Premium feature: long continuous laser guide sight line
      this.ctx.strokeStyle = skin === 'golden' ? 'rgba(255, 215, 0, 0.45)' : 'rgba(0, 255, 255, 0.5)';
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([8, 8]);
      this.ctx.shadowColor = skin === 'golden' ? '#ffd700' : '#00ffff';
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      
      let px = startX;
      let py = startY;
      this.ctx.moveTo(px, py);
      
      // Step simulation points
      for (let i = 1; i <= 35; i++) {
        const t = i * 2.2;
        const curX = startX + vx * t;
        // Simple kinematics
        const curY = startY + vy * t + 0.5 * gravity * 1000 * (t * t / 60);
        
        if (curY > CANVAS_HEIGHT - 70) {
          this.ctx.lineTo(curX, CANVAS_HEIGHT - 70);
          break;
        }
        this.ctx.lineTo(curX, curY);
      }
      this.ctx.stroke();

    } else {
      // Standard trajectory: fading dotted circles
      this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 1; i <= 15; i++) {
        const t = i * 2.5; // step time
        const curX = startX + vx * t;
        const curY = startY + vy * t + 0.5 * gravity * 1000 * (t * t / 60);

        if (curY > CANVAS_HEIGHT - 70) break;

        const size = Math.max(1, 5 - i * 0.25);
        this.ctx.globalAlpha = 1.0 - i / 18;
        this.ctx.beginPath();
        this.ctx.arc(curX, curY, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }
}

// Instantiate and start Game
const game = new GameController();
window.game = game;
window.addEventListener('load', () => {
  game.init();
  const loader = document.getElementById('loading-screen');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
    }, 500);
  }
});
