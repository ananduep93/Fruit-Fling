// Shop Cosmetics Catalog for Fruit Fling

const SHOP_CATALOG = {
  trail: [
    { id: 'classic', name: 'Classic Smoke', desc: 'Standard puff trail. Standard stats.', requiredStars: 0 },
    { id: 'rainbow', name: 'Rainbow Blast', desc: 'Beautiful cycle of vibrant colors. +10% score!', requiredStars: 10 },
    { id: 'fire', name: 'Fire Trail', desc: 'Flame embers and sparks. +15% fruit destruction power!', requiredStars: 25 },
    { id: 'sparkle', name: 'Cyan Glow', desc: 'Glinting stars and cosmic trails. +15% max slingshot drag radius!', requiredStars: 40 },
    { id: 'bubble', name: 'Water Bubbles', desc: 'Floating transparent soap bubbles. -50% air resistance & -10% gravity!', requiredStars: 50 }
  ],
  slingshot: [
    { id: 'classic', name: 'Classic Wood', desc: 'Reliable wooden slingshot. Standard launch speed.', requiredStars: 0 },
    { id: 'bubble', name: 'Coral Slingshot', desc: 'Cute tropical marine design. +10% launch speed & -20% gravity!', requiredStars: 15 },
    { id: 'golden', name: 'Golden Slingshot', desc: 'Shining gold band + laser guide. +15% launch speed!', requiredStars: 30 },
    { id: 'laser', name: 'Futuristic Blaster', desc: 'Neon glowing grips + digital sight. +25% launch speed!', requiredStars: 55 }
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

    const totalStars = storage.getTotalStars();
    if (totalStars < item.requiredStars) {
      return { success: false, message: `Requires ${item.requiredStars} stars to unlock!` };
    }

    // Unlock item and select
    storage.unlockItem(category, itemId);
    storage.selectItem(category, itemId);
    
    // Play cash register/bell synth sound
    audio.playSfx('impact_metal');
    return { success: true, message: "Unlocked and equipped!" };
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
