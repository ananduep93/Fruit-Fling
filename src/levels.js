const WORLDS = [
  {
    id: 'world_1',
    name: 'Jungle Village',
    bgColors: ['#3f752a', '#1e4612'], // Sky and deep ground gradients
    ambientScale: 'major',
    gravity: 1.0,
    levels: [
      {
        id: 'w1_l1',
        name: 'First Fling',
        fruits: ['apple', 'apple', 'banana'],
        monkeys: [
          { type: 'basic', x: 900, y: 630 }
        ],
        blocks: [
          // A simple wooden frame protecting the monkey
          { material: 'wood', shape: 'box', x: 900, y: 540, w: 100, h: 20, angle: 0 }, // Roof
          { material: 'wood', shape: 'box', x: 860, y: 600, w: 20, h: 100, angle: 0 }, // Left pillar
          { material: 'wood', shape: 'box', x: 940, y: 600, w: 20, h: 100, angle: 0 }  // Right pillar
        ],
        star3: 1000,
        star2: 700,
        coins: 15
      },
      {
        id: 'w1_l2',
        name: 'Jungle Pillars',
        fruits: ['apple', 'coconut', 'banana'],
        monkeys: [
          { type: 'basic', x: 840, y: 630 },
          { type: 'basic', x: 990, y: 630 }
        ],
        blocks: [
          // Double tower structure
          { material: 'wood', shape: 'box', x: 800, y: 590, w: 20, h: 120, angle: 0 },
          { material: 'wood', shape: 'box', x: 880, y: 590, w: 20, h: 120, angle: 0 },
          { material: 'wood', shape: 'box', x: 840, y: 520, w: 120, h: 20, angle: 0 }, // platform
          
          { material: 'wood', shape: 'box', x: 950, y: 590, w: 20, h: 120, angle: 0 },
          { material: 'wood', shape: 'box', x: 1030, y: 590, w: 20, h: 120, angle: 0 },
          { material: 'wood', shape: 'box', x: 990, y: 520, w: 120, h: 20, angle: 0 }  // platform
        ],
        star3: 2000,
        star2: 1400,
        coins: 25
      },
      {
        id: 'w1_l3',
        name: 'The Big House',
        fruits: ['apple', 'coconut', 'banana', 'strawberry'],
        monkeys: [
          { type: 'basic', x: 740, y: 630 },
          { type: 'tough', x: 900, y: 508 }, // Protected on second floor platform
          { type: 'basic', x: 1060, y: 630 }
        ],
        blocks: [
          // First Floor
          { material: 'wood', shape: 'box', x: 700, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 800, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 1000, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 1100, y: 600, w: 20, h: 100, angle: 0 },
          
          // Platforms
          { material: 'wood', shape: 'box', x: 740, y: 540, w: 120, h: 20, angle: 0 },
          { material: 'wood', shape: 'box', x: 900, y: 540, w: 200, h: 20, angle: 0 }, // Center floor connecting platforms
          { material: 'wood', shape: 'box', x: 1060, y: 540, w: 120, h: 20, angle: 0 },
          
          // Second Floor
          { material: 'wood', shape: 'box', x: 830, y: 480, w: 20, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 970, y: 480, w: 20, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 900, y: 420, w: 180, h: 20, angle: 0 } // Roof
        ],
        star3: 3500,
        star2: 2400,
        coins: 35
      }
    ]
  },
  {
    id: 'world_2',
    name: 'Beach Resort',
    bgColors: ['#4da6ff', '#e6f2ff'], // Tropical blue skies
    ambientScale: 'major',
    gravity: 1.0,
    levels: [
      {
        id: 'w2_l1',
        name: 'Balloon Ascent',
        fruits: ['banana', 'banana', 'coconut'],
        monkeys: [
          { type: 'balloon', x: 850, y: 350 }, // Suspended in mid-air on balloon
          { type: 'basic', x: 850, y: 630 }
        ],
        blocks: [
          { material: 'bamboo', shape: 'box', x: 800, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'bamboo', shape: 'box', x: 900, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'bamboo', shape: 'box', x: 850, y: 540, w: 120, h: 20, angle: 0 }
        ],
        star3: 1800,
        star2: 1200,
        coins: 20
      },
      {
        id: 'w2_l2',
        name: 'Bamboo Grid',
        fruits: ['apple', 'watermelon', 'coconut'],
        monkeys: [
          { type: 'balloon', x: 750, y: 300 },
          { type: 'balloon', x: 950, y: 300 },
          { type: 'tough', x: 850, y: 608 } // Stands on the lower table
        ],
        blocks: [
          // Highly breakable bamboo structures
          { material: 'bamboo', shape: 'box', x: 800, y: 550, w: 20, h: 200, angle: 0 },
          { material: 'bamboo', shape: 'box', x: 900, y: 550, w: 20, h: 200, angle: 0 },
          { material: 'bamboo', shape: 'box', x: 850, y: 440, w: 160, h: 20, angle: 0 }, // upper bridge
          
          { material: 'bamboo', shape: 'box', x: 850, y: 640, w: 80, h: 20, angle: 0 } // lower table
        ],
        star3: 3000,
        star2: 2000,
        coins: 30
      },
      {
        id: 'w2_l3',
        name: 'Sand Castle Siege',
        fruits: ['watermelon', 'coconut', 'strawberry', 'banana'],
        monkeys: [
          { type: 'balloon', x: 800, y: 250 },
          { type: 'tough', x: 800, y: 628 },
          { type: 'balloon', x: 1000, y: 250 },
          { type: 'tough', x: 1000, y: 628 }
        ],
        blocks: [
          // Elaborate castle gate
          { material: 'bamboo', shape: 'box', x: 730, y: 550, w: 30, h: 200, angle: 0 },
          { material: 'bamboo', shape: 'box', x: 870, y: 550, w: 30, h: 200, angle: 0 },
          { material: 'wood', shape: 'box', x: 800, y: 440, w: 170, h: 20, angle: 0 }, // lintel wood
          
          { material: 'bamboo', shape: 'box', x: 930, y: 550, w: 30, h: 200, angle: 0 },
          { material: 'bamboo', shape: 'box', x: 1070, y: 550, w: 30, h: 200, angle: 0 },
          { material: 'wood', shape: 'box', x: 1000, y: 440, w: 170, h: 20, angle: 0 }, // lintel wood
 
          { material: 'bamboo', shape: 'circle', x: 800, y: 400, w: 60, h: 60, angle: 0 }, // decoration domes
          { material: 'bamboo', shape: 'circle', x: 1000, y: 400, w: 60, h: 60, angle: 0 }
        ],
        star3: 5000,
        star2: 3500,
        coins: 40
      }
    ]
  },
  {
    id: 'world_3',
    name: 'Ancient Temple',
    bgColors: ['#2c3539', '#5c6b73'], // Overcast ruins
    ambientScale: 'minor',
    gravity: 1.0,
    levels: [
      {
        id: 'w3_l1',
        name: 'Stone Archway',
        fruits: ['coconut', 'coconut', 'strawberry'],
        monkeys: [
          { type: 'tough', x: 900, y: 628 }
        ],
        blocks: [
          // Heavy stone block arch
          { material: 'stone', shape: 'box', x: 900, y: 485, w: 150, h: 30, angle: 0 }, // Heavy arch stone
          { material: 'stone', shape: 'box', x: 850, y: 575, w: 35, h: 150, angle: 0 }, // thick stone pillar
          { material: 'stone', shape: 'box', x: 950, y: 575, w: 35, h: 150, angle: 0 }
        ],
        star3: 2000,
        star2: 1400,
        coins: 20
      },
      {
        id: 'w3_l2',
        name: 'The Vault',
        fruits: ['coconut', 'strawberry', 'watermelon', 'banana'],
        monkeys: [
          { type: 'tough', x: 800, y: 628 },
          { type: 'tough', x: 1000, y: 628 }
        ],
        blocks: [
          // Grid of stone and wood beams
          { material: 'stone', shape: 'box', x: 750, y: 570, w: 40, h: 160, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 570, w: 40, h: 160, angle: 0 },
          { material: 'stone', shape: 'box', x: 950, y: 570, w: 40, h: 160, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 570, w: 40, h: 160, angle: 0 },
          
          { material: 'wood', shape: 'box', x: 800, y: 480, w: 140, h: 20, angle: 0 },
          { material: 'wood', shape: 'box', x: 1000, y: 480, w: 140, h: 20, angle: 0 },
 
          { material: 'stone', shape: 'circle', x: 800, y: 440, w: 60, h: 60, angle: 0 },
          { material: 'stone', shape: 'circle', x: 1000, y: 440, w: 60, h: 60, angle: 0 }
        ],
        star3: 4000,
        star2: 2800,
        coins: 35
      },
      {
        id: 'w3_l3',
        name: 'Pillar Collapse',
        fruits: ['coconut', 'coconut', 'strawberry', 'strawberry'],
        monkeys: [
          { type: 'tough', x: 800, y: 628 },
          { type: 'tough', x: 950, y: 628 },
          { type: 'tough', x: 1100, y: 628 }
        ],
        blocks: [
          // 3 tall stone columns leaning against each other
          { material: 'stone', shape: 'box', x: 800, y: 540, w: 30, h: 220, angle: 0.05 },
          { material: 'stone', shape: 'box', x: 950, y: 540, w: 30, h: 220, angle: -0.05 },
          { material: 'stone', shape: 'box', x: 1100, y: 540, w: 30, h: 220, angle: 0 },
          
          { material: 'wood', shape: 'box', x: 875, y: 420, w: 180, h: 20, angle: 0 },
          { material: 'wood', shape: 'box', x: 1025, y: 420, w: 180, h: 20, angle: 0 },
          
          { material: 'stone', shape: 'triangle', x: 950, y: 375, w: 80, h: 80, angle: 0 }
        ],
        star3: 5500,
        star2: 3800,
        coins: 45
      }
    ]
  },
  {
    id: 'world_4',
    name: 'Volcano Island',
    bgColors: ['#1a0505', '#52140a'], // Fiery hellish skies
    ambientScale: 'minor',
    gravity: 1.0,
    levels: [
      {
        id: 'w4_l1',
        name: 'Builder Shield',
        fruits: ['apple', 'strawberry', 'coconut'],
        monkeys: [
          { type: 'builder', x: 900, y: 629 } // Spawns dynamic shield when fruit gets close!
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 850, y: 600, w: 30, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 950, y: 600, w: 30, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 900, y: 540, w: 130, h: 20, angle: 0 }
        ],
        star3: 2200,
        star2: 1500,
        coins: 20
      },
      {
        id: 'w4_l2',
        name: 'Lava Chambers',
        fruits: ['strawberry', 'strawberry', 'banana', 'coconut'],
        monkeys: [
          { type: 'builder', x: 800, y: 629 },
          { type: 'tough', x: 950, y: 628 }
        ],
        blocks: [
          // Stone chambers loaded with metal structural joints
          { material: 'stone', shape: 'box', x: 740, y: 570, w: 30, h: 160, angle: 0 },
          { material: 'stone', shape: 'box', x: 860, y: 570, w: 30, h: 160, angle: 0 },
          { material: 'metal', shape: 'box', x: 800, y: 480, w: 150, h: 20, angle: 0 },
          
          { material: 'stone', shape: 'box', x: 890, y: 570, w: 30, h: 160, angle: 0 },
          { material: 'stone', shape: 'box', x: 1010, y: 570, w: 30, h: 160, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 480, w: 150, h: 20, angle: 0 }
        ],
        star3: 4000,
        star2: 2800,
        coins: 35
      },
      {
        id: 'w4_l3',
        name: 'The Magma Vault',
        fruits: ['coconut', 'coconut', 'strawberry', 'watermelon'],
        monkeys: [
          { type: 'builder', x: 800, y: 509 },
          { type: 'tough', x: 950, y: 628 },
          { type: 'builder', x: 1100, y: 509 }
        ],
        blocks: [
          // Giant stone fort with builder monkeys on high platforms
          { material: 'stone', shape: 'box', x: 750, y: 600, w: 40, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 600, w: 40, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 540, w: 140, h: 20, angle: 0 }, // middle floor
 
          { material: 'stone', shape: 'box', x: 1050, y: 600, w: 40, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1150, y: 600, w: 40, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 540, w: 140, h: 20, angle: 0 }, // middle floor
          
          { material: 'metal', shape: 'box', x: 950, y: 600, w: 40, h: 100, angle: 0 }, // central core
          
          // Second floor supporting columns for high bridge stability
          { material: 'wood', shape: 'box', x: 750, y: 490, w: 20, h: 80, angle: 0 },
          { material: 'wood', shape: 'box', x: 1150, y: 490, w: 20, h: 80, angle: 0 },
 
          { material: 'wood', shape: 'box', x: 950, y: 440, w: 420, h: 20, angle: 0 } // high bridge connecting them
        ],
        star3: 6000,
        star2: 4200,
        coins: 50
      }
    ]
  },
  {
    id: 'world_5',
    name: 'Monkey City',
    bgColors: ['#000022', '#000055'], // Cyberpunk dark neon skies
    ambientScale: 'space',
    gravity: 1.0,
    levels: [
      {
        id: 'w5_l1',
        name: 'Glass Skyscrapers',
        fruits: ['banana', 'coconut', 'strawberry'],
        monkeys: [
          { type: 'basic', x: 850, y: 510 },
          { type: 'basic', x: 850, y: 630 }
        ],
        blocks: [
          // Glass structures shatter instantly on heavy hit, triggering chain reactions
          { material: 'glass', shape: 'box', x: 800, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 900, y: 600, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 850, y: 540, w: 120, h: 20, angle: 0 },
          
          { material: 'glass', shape: 'box', x: 810, y: 480, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 890, y: 480, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 850, y: 420, w: 100, h: 20, angle: 0 }
        ],
        star3: 3000,
        star2: 2000,
        coins: 30
      },
      {
        id: 'w5_l2',
        name: 'Steel & Glass Grids',
        fruits: ['watermelon', 'strawberry', 'coconut', 'banana'],
        monkeys: [
          { type: 'tough', x: 785, y: 628 }, // Safely positioned away from pillar coordinates
          { type: 'builder', x: 900, y: 629 },
          { type: 'balloon', x: 900, y: 350 }
        ],
        blocks: [
          // Toughest metal blocks supporting fragile glass
          { material: 'metal', shape: 'box', x: 750, y: 580, w: 30, h: 140, angle: 0 },
          { material: 'glass', shape: 'box', x: 820, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'glass', shape: 'box', x: 980, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1050, y: 580, w: 30, h: 140, angle: 0 },
          
          { material: 'metal', shape: 'box', x: 900, y: 500, w: 350, h: 20, angle: 0 }, // long metal girder
 
          { material: 'glass', shape: 'circle', x: 900, y: 450, w: 80, h: 80, angle: 0 } // fragile dome on top
        ],
        star3: 5000,
        star2: 3500,
        coins: 40
      },
      {
        id: 'w5_l3',
        name: 'The Penthouse',
        fruits: ['coconut', 'coconut', 'strawberry', 'watermelon', 'banana'],
        monkeys: [
          { type: 'builder', x: 820, y: 449 },
          { type: 'tough', x: 950, y: 628 },
          { type: 'balloon', x: 950, y: 250 },
          { type: 'builder', x: 1080, y: 449 }
        ],
        blocks: [
          // Huge double-tower city skyscraper
          { material: 'metal', shape: 'box', x: 780, y: 570, w: 30, h: 160, angle: 0 },
          { material: 'glass', shape: 'box', x: 820, y: 570, w: 20, h: 160, angle: 0 },
          { material: 'metal', shape: 'box', x: 800, y: 480, w: 100, h: 20, angle: 0 }, // deck 1
          
          { material: 'metal', shape: 'box', x: 1080, y: 570, w: 30, h: 160, angle: 0 },
          { material: 'glass', shape: 'box', x: 1120, y: 570, w: 20, h: 160, angle: 0 },
          { material: 'metal', shape: 'box', x: 1100, y: 480, w: 100, h: 20, angle: 0 }, // deck 2
 
          // Pillars supporting the main bridge platform
          { material: 'metal', shape: 'box', x: 780, y: 440, w: 20, h: 60, angle: 0 },
          { material: 'metal', shape: 'box', x: 1120, y: 440, w: 20, h: 60, angle: 0 },
 
          { material: 'metal', shape: 'box', x: 950, y: 400, w: 400, h: 20, angle: 0 }, // bridge
          { material: 'glass', shape: 'box', x: 900, y: 340, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 1000, y: 340, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 280, w: 120, h: 20, angle: 0 }  // apex roof
        ],
        star3: 7500,
        star2: 5000,
        coins: 60
      }
    ]
  },
  {
    id: 'world_6',
    name: 'Space Bananas',
    bgColors: ['#03001e', '#7303c0', '#ec38bc'], // Galactic nebula gradients
    ambientScale: 'space',
    gravity: 0.16, // LOW GRAVITY IN SPACE! Extremely floaty physics!
    levels: [
      {
        id: 'w6_l1',
        name: 'Zero G Ruins',
        fruits: ['banana', 'banana', 'strawberry'],
        monkeys: [
          { type: 'basic', x: 850, y: 300 },
          { type: 'tough', x: 850, y: 628 }
        ],
        blocks: [
          // Low gravity blocks float easily and fall slowly!
          { material: 'stone', shape: 'box', x: 850, y: 450, w: 180, h: 30, angle: 0.2 }, // slanted floating panel
          { material: 'wood', shape: 'box', x: 750, y: 600, w: 30, h: 100, angle: 0 },
          { material: 'wood', shape: 'box', x: 950, y: 600, w: 30, h: 100, angle: 0 }
        ],
        star3: 2500,
        star2: 1700,
        coins: 30
      },
      {
        id: 'w6_l2',
        name: 'Lunar Landing',
        fruits: ['watermelon', 'coconut', 'banana', 'strawberry'],
        monkeys: [
          { type: 'balloon', x: 800, y: 300 }, // balloon monkey floats even higher in space!
          { type: 'tough', x: 900, y: 528 },
          { type: 'builder', x: 1000, y: 529 }
        ],
        blocks: [
          // Low gravity layout
          { material: 'stone', shape: 'circle', x: 800, y: 610, w: 80, h: 80, angle: 0 },
          { material: 'stone', shape: 'circle', x: 1000, y: 610, w: 80, h: 80, angle: 0 },
          { material: 'metal', shape: 'box', x: 900, y: 560, w: 200, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 900, y: 500, w: 20, h: 100, angle: 0 }
        ],
        star3: 4500,
        star2: 3000,
        coins: 45
      },
      {
        id: 'w6_l3',
        name: 'The King of Space',
        fruits: ['coconut', 'coconut', 'strawberry', 'watermelon', 'banana'],
        monkeys: [
          { type: 'king', x: 950, y: 582 }, // King Monkey BOSS!
          { type: 'builder', x: 750, y: 529 },
          { type: 'builder', x: 1150, y: 529 }
        ],
        blocks: [
          // Castle in space protecting the King Monkey
          { material: 'metal', shape: 'box', x: 750, y: 600, w: 40, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 1150, y: 600, w: 40, h: 100, angle: 0 },
          
          { material: 'stone', shape: 'box', x: 950, y: 635, w: 220, h: 30, angle: 0 }, // Throne platform
          
          // Outer shields
          { material: 'glass', shape: 'box', x: 850, y: 585, w: 20, h: 130, angle: 0.1 },
          { material: 'glass', shape: 'box', x: 1050, y: 585, w: 20, h: 130, angle: -0.1 },
          
          { material: 'metal', shape: 'box', x: 950, y: 510, w: 320, h: 20, angle: 0 }, // roof
          { material: 'stone', shape: 'circle', x: 950, y: 465, w: 70, h: 70, angle: 0 }
        ],
        star3: 8500,
        star2: 6000,
        coins: 100
      }
    ]
  },
  {
    id: 'world_7',
    name: 'Cyber Void',
    bgColors: ['#0d0c1d', '#00d2ff'],
    ambientScale: 'space',
    gravity: 1.0,
    levels: [
      {
        id: 'w7_l1',
        name: 'Digital Gateway',
        fruits: ['apple', 'banana', 'coconut'],
        monkeys: [
          { type: 'tough', x: 950, y: 628 },
          { type: 'basic', x: 779, y: 470 },
          { type: 'basic', x: 1121, y: 470 }
        ],
        blocks: [
          { material: 'metal', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 2000,
        star2: 1300,
        coins: 25
      },
      {
        id: 'w7_l2',
        name: 'Cyber Shield',
        fruits: ['banana', 'strawberry', 'watermelon'],
        monkeys: [
          { type: 'builder', x: 779, y: 469 },
          { type: 'builder', x: 1121, y: 469 },
          { type: 'balloon', x: 950, y: 352 }
        ],
        blocks: [
          { material: 'metal', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 3000,
        star2: 2000,
        coins: 35
      },
      {
        id: 'w7_l3',
        name: 'Core Processor',
        fruits: ['coconut', 'watermelon', 'strawberry', 'banana'],
        monkeys: [
          { type: 'tough', x: 779, y: 468 },
          { type: 'tough', x: 1121, y: 468 },
          { type: 'builder', x: 950, y: 629 },
          { type: 'balloon', x: 950, y: 352 }
        ],
        blocks: [
          { material: 'metal', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 4500,
        star2: 3000,
        coins: 50
      }
    ]
  },
  {
    id: 'world_8',
    name: 'Ice Glacier',
    bgColors: ['#e0f7fa', '#00838f'],
    ambientScale: 'major',
    gravity: 0.85,
    levels: [
      {
        id: 'w8_l1',
        name: 'Frosty Fort',
        fruits: ['coconut', 'strawberry', 'banana'],
        monkeys: [
          { type: 'basic', x: 950, y: 630 },
          { type: 'basic', x: 779, y: 630 },
          { type: 'basic', x: 1121, y: 630 }
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'glass', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'stone', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 1500,
        star2: 1000,
        coins: 25
      },
      {
        id: 'w8_l2',
        name: 'Slippery Slope',
        fruits: ['apple', 'watermelon', 'coconut'],
        monkeys: [
          { type: 'tough', x: 950, y: 628 },
          { type: 'balloon', x: 950, y: 352 }
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'glass', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'stone', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 2800,
        star2: 1800,
        coins: 35
      },
      {
        id: 'w8_l3',
        name: 'Glacier Summit',
        fruits: ['coconut', 'coconut', 'banana', 'strawberry'],
        monkeys: [
          { type: 'king', x: 950, y: 612 },
          { type: 'tough', x: 779, y: 468 },
          { type: 'tough', x: 1121, y: 468 }
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'glass', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'glass', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'stone', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'glass', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 5500,
        star2: 3800,
        coins: 60
      }
    ]
  },
  {
    id: 'world_9',
    name: 'Golden Palace',
    bgColors: ['#4a0e4e', '#ffd700'],
    ambientScale: 'minor',
    gravity: 1.1,
    levels: [
      {
        id: 'w9_l1',
        name: 'Palace Gates',
        fruits: ['apple', 'strawberry', 'coconut'],
        monkeys: [
          { type: 'tough', x: 950, y: 628 },
          { type: 'basic', x: 779, y: 630 },
          { type: 'basic', x: 1121, y: 630 }
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'stone', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 2500,
        star2: 1600,
        coins: 30
      },
      {
        id: 'w9_l2',
        name: 'Royal Guard',
        fruits: ['banana', 'watermelon', 'coconut', 'coconut'],
        monkeys: [
          { type: 'builder', x: 779, y: 469 },
          { type: 'builder', x: 1121, y: 469 },
          { type: 'tough', x: 950, y: 628 }
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'stone', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 5000,
        star2: 3500,
        coins: 45
      },
      {
        id: 'w9_l3',
        name: 'King\'s Treasury',
        fruits: ['watermelon', 'watermelon', 'coconut', 'strawberry', 'banana'],
        monkeys: [
          { type: 'king', x: 950, y: 612 },
          { type: 'builder', x: 779, y: 469 },
          { type: 'builder', x: 1121, y: 469 },
          { type: 'balloon', x: 950, y: 352 }
        ],
        blocks: [
          { material: 'stone', shape: 'box', x: 760, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 800, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 850, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1050, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1100, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'stone', shape: 'box', x: 1140, y: 580, w: 24, h: 140, angle: 0 },
          { material: 'metal', shape: 'box', x: 779, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 1121, y: 500, w: 78, h: 20, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 500, w: 256, h: 20, angle: 0 },
          { material: 'stone', shape: 'box', x: 900, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'stone', shape: 'box', x: 1000, y: 430, w: 20, h: 100, angle: 0 },
          { material: 'metal', shape: 'box', x: 950, y: 380, w: 140, h: 20, angle: 0 }
        ],
        star3: 9000,
        star2: 6500,
        coins: 100
      }
    ]
  }
];
window.WORLDS = WORLDS;
