// Storage Manager for saving game progress and unlockables

const STORAGE_KEY = 'fruit_fling_save_data';

const DEFAULT_SAVE = {
  unlockedWorlds: ['world_1'], // world_1, world_2, ...
  completedLevels: {}, // { level_id: stars_count }
  coins: 100, // start with some coins to test the shop
  goldenBananas: 0,
  unlockedTrails: ['classic'], // classic, rainbow, fire, sparkle, bubble
  unlockedSlingshots: ['classic'], // classic, golden, laser, bubble, futuristic
  unlockedFruitSkins: ['classic'], // classic, golden
  selectedTrail: 'classic',
  selectedSlingshot: 'classic',
  selectedFruitSkin: 'classic',
  highScores: {}, // { level_id: score }
  settings: {
    soundVolume: 0.8,
    musicVolume: 0.5,
    screenShake: true
  }
};

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults in case of updates
        return { ...DEFAULT_SAVE, ...parsed, settings: { ...DEFAULT_SAVE.settings, ...parsed.settings } };
      }
    } catch (e) {
      console.error("Failed to load save data", e);
    }
    return { ...DEFAULT_SAVE };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  }

  getCoins() {
    return this.data.coins;
  }

  addCoins(amount) {
    this.data.coins += amount;
    this.save();
  }

  spendCoins(amount) {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getGoldenBananas() {
    return this.data.goldenBananas;
  }

  addGoldenBanana() {
    this.data.goldenBananas += 1;
    this.save();
  }

  unlockWorld(worldId) {
    if (!this.data.unlockedWorlds.includes(worldId)) {
      this.data.unlockedWorlds.push(worldId);
      this.save();
    }
  }

  isWorldUnlocked(worldId) {
    return this.data.unlockedWorlds.includes(worldId);
  }

  completeLevel(levelId, stars, score) {
    // Record stars if higher than previous attempt
    const prevStars = this.data.completedLevels[levelId] || 0;
    if (stars > prevStars) {
      this.data.completedLevels[levelId] = stars;
    }

    // Record high score
    const prevScore = this.data.highScores[levelId] || 0;
    if (score > prevScore) {
      this.data.highScores[levelId] = score;
    }

    this.save();
  }

  getLevelStars(levelId) {
    return this.data.completedLevels[levelId] || 0;
  }

  getLevelHighScore(levelId) {
    return this.data.highScores[levelId] || 0;
  }

  // Cosmetics
  unlockItem(category, itemId) {
    const listKey = category === 'trail' ? 'unlockedTrails' : 
                    category === 'slingshot' ? 'unlockedSlingshots' : 'unlockedFruitSkins';
    
    if (!this.data[listKey].includes(itemId)) {
      this.data[listKey].push(itemId);
      this.save();
      return true;
    }
    return false;
  }

  isItemUnlocked(category, itemId) {
    const listKey = category === 'trail' ? 'unlockedTrails' : 
                    category === 'slingshot' ? 'unlockedSlingshots' : 'unlockedFruitSkins';
    return this.data[listKey].includes(itemId);
  }

  selectItem(category, itemId) {
    const selectKey = category === 'trail' ? 'selectedTrail' : 
                      category === 'slingshot' ? 'selectedSlingshot' : 'selectedFruitSkin';
    
    if (this.isItemUnlocked(category, itemId)) {
      this.data[selectKey] = itemId;
      this.save();
      return true;
    }
    return false;
  }

  getSelectedItem(category) {
    const selectKey = category === 'trail' ? 'selectedTrail' : 
                      category === 'slingshot' ? 'selectedSlingshot' : 'selectedFruitSkin';
    return this.data[selectKey];
  }

  // Settings
  setSetting(key, value) {
    if (key in this.data.settings) {
      this.data.settings[key] = value;
      this.save();
    }
  }

  getSetting(key) {
    return this.data.settings[key];
  }
}

export const storage = new StorageManager();
