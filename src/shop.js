// Shop Cosmetics Catalog for Fruit Fling

const SHOP_CATALOG = {
  trail: [
    { id: 'classic', name: 'Classic Smoke', desc: 'Standard puff trail. Standard stats.', cost: 0 },
    { id: 'rainbow', name: 'Rainbow Blast', desc: 'Beautiful cycle of vibrant colors. +10% score and coins!', cost: 80 },
    { id: 'fire', name: 'Fire Trail', desc: 'Flame embers and sparks. +15% fruit destruction power!', cost: 180 },
    { id: 'sparkle', name: 'Cyan Glow', desc: 'Glinting stars and cosmic trails. +15% max slingshot drag radius!', cost: 240 },
    { id: 'bubble', name: 'Water Bubbles', desc: 'Floating transparent soap bubbles. -50% air resistance & -10% gravity!', cost: 300 }
  ],
  slingshot: [
    { id: 'classic', name: 'Classic Wood', desc: 'Reliable wooden slingshot. Standard launch speed.', cost: 0 },
    { id: 'golden', name: 'Golden Slingshot', desc: 'Shining gold band + laser guide. +15% launch speed!', cost: 200 },
    { id: 'laser', name: 'Futuristic Blaster', desc: 'Neon glowing grips + digital sight. +25% launch speed!', cost: 350 },
    { id: 'bubble', name: 'Coral Slingshot', desc: 'Cute tropical marine design. +10% launch speed & -20% gravity!', cost: 150 }
  ]
};

class ShopManager {
  getCatalog() {
    const catalog = {};
    
    for (const category in SHOP_CATALOG) {
      catalog[category] = SHOP_CATALOG[category].map(item => {
        return {
          ...item,
          isUnlocked: storage.isItemUnlocked(category, item.id),
          isSelected: storage.getSelectedItem(category) === item.id
        };
      });
    }
    
    return catalog;
  }

  buyItem(category, itemId) {
    const item = SHOP_CATALOG[category]?.find(i => i.id === itemId);
    if (!item) return { success: false, message: "Item not found" };

    if (storage.isItemUnlocked(category, itemId)) {
      // Already unlocked, just select it
      storage.selectItem(category, itemId);
      audio.playSfx('click');
      return { success: true, message: "Item equipped!" };
    }

    const coins = storage.getCoins();
    if (coins < item.cost) {
      return { success: false, message: "Not enough coins!" };
    }

    // Deduct coins & unlock
    if (storage.spendCoins(item.cost)) {
      storage.unlockItem(category, itemId);
      storage.selectItem(category, itemId);
      
      // Play cash register/bell synth sound
      audio.playSfx('impact_metal');
      return { success: true, message: "Purchased and equipped!" };
    }

    return { success: false, message: "Purchase failed" };
  }

  selectItem(category, itemId) {
    if (storage.isItemUnlocked(category, itemId)) {
      storage.selectItem(category, itemId);
      audio.playSfx('click');
      return true;
    }
    return false;
  }
}

const shop = new ShopManager();
window.shop = shop;
window.SHOP_CATALOG = SHOP_CATALOG;
