# Asheron's Call Idler - Fresh Start Design Document V2
## An Authentic Dereth Experience with Modern Idle Mechanics

### Core Philosophy
Create an authentic Asheron's Call experience through an idle game lens. Every tap channels the spirit of Dereth while delivering modern mobile satisfaction. We honor AC's depth while ensuring immediate accessibility.

**Design Mantra:** "Welcome to Dereth, Newcomer. Your patron Asheron awaits."

---

## 1. The Portal to Dereth (First 30 Seconds)

### 1.1 First Launch Experience
```
App Opens → Classic AC Portal Swirl (purple/blue) → 
"Welcome to Dereth" → Drudge Prowler Appears → 
TAP TO STRIKE! → Damage Numbers (AC Font) → 
Pyreals scatter → "LEVEL UP!" → 
"You have reached Level 2!" (Classic AC notification)
```

**The hook is instant, the depth reveals itself.**

### 1.2 Core Combat - AC's Attack Height System
```typescript
interface DerethCombat {
  // MELEE COMBAT - Based on AC's attack height system
  meleeCombat: {
    attackHeight: 'high' | 'medium' | 'low';  // AC's classic system
    
    highAttack: {
      tap: 'Quick tap',
      accuracy: 0.9,               // Most accurate
      damage: 1.0,                  // Base damage
      speed: 'fast',
      target: 'head/upper body',
      weakness: 'Low defense beats high attack'
    },
    
    mediumAttack: {
      tap: 'Normal tap',
      accuracy: 0.8,                // Balanced
      damage: 1.2,                  // Moderate boost
      speed: 'medium',
      target: 'chest/torso',
      weakness: 'High defense beats medium'
    },
    
    lowAttack: {
      tap: 'Hold tap',
      accuracy: 0.7,                // Least accurate
      damage: 1.5,                  // Highest damage
      speed: 'slow',
      target: 'legs/lower body',
      weakness: 'Medium defense beats low'
    },
    
    powerBar: {
      buildsFrom: 'Successful hits with correct height',
      maxPower: 100,
      effect: 'Next attack is guaranteed critical'
    }
  },
  
  // MAGIC COMBAT - Spell charging system
  magicCombat: {
    spellCharge: {
      tap: 'Hold to charge spell power',
      chargeTime: 0-3000,  // milliseconds
      
      levels: {
        instant: { time: 0, power: 0.5, mana: 5 },      // Quick cast
        normal: { time: 1000, power: 1.0, mana: 10 },   // Standard
        empowered: { time: 2000, power: 2.0, mana: 20 }, // Strong
        maximum: { time: 3000, power: 3.0, mana: 40 }    // Devastating
      }
    },
    
    spellCombo: {
      mechanism: 'Cast spells in sequence for combos',
      examples: {
        'Flame + Frost': 'Steam explosion for area damage',
        'Lightning + Lightning': 'Chain lightning jumps to all enemies',
        'Buff + Attack': 'Enhanced damage on next spell'
      }
    },
    
    fizzle: {
      chance: 'Based on Focus and skill level',
      effect: 'Spell fails, lose mana, brief cooldown',
      visual: 'Spell explodes in caster\'s face'
    }
  },
  
  // RANGED COMBAT - Aim and timing system
  rangedCombat: {
    drawMechanic: {
      tap: 'Hold to draw bow/crossbow',
      
      drawLevels: {
        quick: { time: 0, damage: 0.7, accuracy: 0.6 },     // Snap shot
        half: { time: 500, damage: 1.0, accuracy: 0.8 },    // Normal shot
        full: { time: 1000, damage: 1.5, accuracy: 0.95 },  // Full draw
        perfect: { time: 1500, damage: 2.0, accuracy: 1.0 } // Perfect shot
      }
    },
    
    targetZones: {
      mechanism: 'Tap location matters for damage',
      zones: {
        head: { multiplier: 2.0, difficulty: 'small target' },
        chest: { multiplier: 1.0, difficulty: 'medium target' },
        limbs: { multiplier: 0.8, difficulty: 'effects movement' }
      }
    },
    
    specialArrows: {
      mechanism: 'Different ammo types from AC',
      types: {
        'Armor Piercing': 'Ignores 50% armor',
        'Elemental': 'Fire/Frost/Lightning damage',
        'Barbed': 'Causes bleed over time',
        'Blunt': 'Stuns on headshot'
      }
    }
  },
  
  // Universal combat feedback
  combatFeedback: {
    damageNumbers: {
      melee: { color: 'white', style: 'slash mark' },
      magic: { color: 'purple', style: 'mystical glow' },
      ranged: { color: 'yellow', style: 'piercing line' },
      critical: { color: 'red', style: 'explosion', size: '2x' }
    },
    
    sounds: {
      melee: ['sword_clash', 'mace_thud', 'blade_slice'],
      magic: ['spell_cast', 'magic_impact', 'fizzle_pop'],
      ranged: ['bow_twang', 'arrow_whistle', 'impact_thunk']
    }
  }
};
```

---

## 2. The Attributes of Dereth (Full AC System)

### 2.1 Complete Attribute System
All six attributes from AC, each with meaningful idle game impact:

```typescript
const derethAttributes = {
  STRENGTH: {
    baseValue: 10,
    maxValue: 100,  // Before buffs
    
    effects: {
      meleeDamage: level => 1 + (level * 0.15),      // +15% per 10 points
      jumpHeight: level => 1 + (level * 0.01),       // For special events
      burden: level => 100 + (level * 5),            // Carry capacity
      heavyWeaponSpeed: level => 1 + (level * 0.05)  // Faster with heavy
    },
    
    description: "Raw physical power",
    
    milestones: {
      25: { unlock: 'Power Attack', desc: 'Every 10th tap deals 3x damage' },
      50: { unlock: 'Lugian Strength', desc: 'Chance to knockback enemies' },
      75: { unlock: 'Crushing Blow', desc: 'Ignore 50% enemy armor' },
      100: { unlock: 'Titan\'s Might', desc: 'All attacks cleave nearby enemies' }
    },
    
    visualEffect: 'Red muscle glow, larger weapon swings'
  },
  
  ENDURANCE: {
    baseValue: 10,
    maxValue: 100,
    
    effects: {
      health: level => 100 + (level * 10),           // Base HP
      healthRegen: level => 1 + (level * 0.1),       // HP per second
      stamina: level => 100 + (level * 5),           // For activities
      offlineBonus: level => 0.5 + (level * 0.005)   // Offline efficiency
    },
    
    description: "Fortitude and resilience",
    
    milestones: {
      25: { unlock: 'Natural Healing', desc: 'Regenerate during combat' },
      50: { unlock: 'Tireless', desc: 'Activities cost 50% less stamina' },
      75: { unlock: 'Second Wind', desc: 'Revive once per portal with 50% HP' },
      100: { unlock: 'Undying', desc: 'Immune to death for 3s after lethal hit' }
    },
    
    visualEffect: 'Green vitality aura, breathing effect'
  },
  
  COORDINATION: {
    baseValue: 10,
    maxValue: 100,
    
    effects: {
      accuracy: level => 0.7 + (level * 0.003),      // Hit chance
      criticalChance: level => 0.05 + (level * 0.005), // Crit rate
      finesseWeaponDamage: level => 1 + (level * 0.2), // Finesse bonus
      dualWieldEfficiency: level => 0.5 + (level * 0.005)
    },
    
    description: "Precision and dexterity",
    
    milestones: {
      25: { unlock: 'Precise Strikes', desc: 'Critical hits deal 3x damage' },
      50: { unlock: 'Flurry', desc: 'Chance for instant double attack' },
      75: { unlock: 'Perfect Balance', desc: 'Cannot miss for 5s after crit' },
      100: { unlock: 'Blade Dance', desc: 'Every attack has 25% crit chance' }
    },
    
    visualEffect: 'Blue precision lines on attacks'
  },
  
  QUICKNESS: {
    baseValue: 10,
    maxValue: 100,
    
    effects: {
      attackSpeed: level => 1 + (level * 0.1),       // Global speed
      runSpeed: level => 1 + (level * 0.05),         // Activity speed
      dodgeChance: level => 0.05 + (level * 0.003),  // Avoid damage
      missileWeaponRate: level => 1 + (level * 0.15) // Bow attack speed
    },
    
    description: "Speed and reflexes",
    
    milestones: {
      25: { unlock: 'Quick Strike', desc: 'First attack always hits' },
      50: { unlock: 'Lightning Reflexes', desc: '10% chance to dodge' },
      75: { unlock: 'Haste', desc: 'All timers reduced by 25%' },
      100: { unlock: 'Temporal Shift', desc: 'Time slows on critical hits' }
    },
    
    visualEffect: 'Yellow speed lines, motion blur'
  },
  
  FOCUS: {
    baseValue: 10,
    maxValue: 100,
    
    effects: {
      mana: level => 50 + (level * 10),              // Mana pool
      manaRegen: level => 1 + (level * 0.1),         // Mana per second
      magicDamage: level => 1 + (level * 0.15),      // Spell power
      assessCreature: level => 1 + (level * 0.02)    // Bonus info/rewards
    },
    
    description: "Mental acuity and magical attunement",
    
    milestones: {
      25: { unlock: 'Mana Burn', desc: 'Convert mana to damage' },
      50: { unlock: 'Arcane Sight', desc: 'See creature weaknesses' },
      75: { unlock: 'Spell Cleave', desc: 'Spells hit multiple enemies' },
      100: { unlock: 'Asheron\'s Gift', desc: 'Unlimited mana for 10s daily' }
    },
    
    visualEffect: 'Purple magical aura, floating runes'
  },
  
  SELF: {
    baseValue: 10,
    maxValue: 100,
    
    effects: {
      xpGain: level => 1 + (level * 0.1),            // XP multiplier
      skillPoints: level => 1 + Math.floor(level/10), // Extra skill points
      magicDefense: level => 1 + (level * 0.05),     // Resist magic
      leadership: level => 1 + (level * 0.02)        // Vassal bonuses
    },
    
    description: "Willpower and magical resistance",
    
    milestones: {
      25: { unlock: 'Fast Learner', desc: '+50% XP from all sources' },
      50: { unlock: 'Enlightened', desc: 'Double skill point gains' },
      75: { unlock: 'Magic Immunity', desc: 'Immune to debuffs' },
      100: { unlock: 'Transcendent', desc: 'All attributes +10% effectiveness' }
    },
    
    visualEffect: 'White inner glow, wisdom particles'
  }
};
```

### 2.2 Attribute Training
```typescript
const attributeTraining = {
  // Automatic growth through gameplay
  passiveGains: {
    onKill: {
      strength: 0.01,      // Melee kills
      coordination: 0.01,  // Critical kills
      quickness: 0.01,     // Speed kills
      endurance: 0.01,     // Survive damage
      focus: 0.01,         // Magic kills
      self: 0.005          // All kills
    }
  },
  
  // Active training through XP spending
  activeTraining: {
    cost: (currentLevel) => Math.pow(currentLevel, 2) * 100,
    maxPerLevel: 10,  // Can only train 10 times per character level
    
    visual: 'Training montage animation',
    sound: 'Level up chime from original AC'
  },
  
  // Special attribute quest rewards
  questRewards: {
    'Drudge Slayer': { strength: +2 },
    'Scholar of Metos': { focus: +2 },
    'Olthoi Survivor': { endurance: +2 }
  }
};
```

---

## 3. The Skills of Combat (AC-Authentic System)

### 3.1 Core Combat Skills
```typescript
const combatSkills = {
  // WEAPON SKILLS
  HEAVY_WEAPONS: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,  // AC's max with buffs
    
    weapons: ['Sword', 'Axe', 'Mace'],
    
    effects: {
      damage: level => 1 + (level * 0.01),        // +1% per level
      armorPenetration: level => level * 0.5,     // Ignore armor
      stunChance: level => level * 0.001          // Chance to stun
    },
    
    abilities: {
      trained: 'Heavy Strike - Charged attacks deal +50% damage',
      specialized: 'Armor Crusher - All attacks ignore 25% armor',
      mastery: 'Whirlwind - Tap rapidly for AOE damage'
    },
    
    visualEffect: 'Weapon glows red, leaves fire trail'
  },
  
  LIGHT_WEAPONS: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    weapons: ['Dagger', 'Katar', 'Short Sword'],
    
    effects: {
      attackSpeed: level => 1 + (level * 0.015),  // +1.5% per level
      criticalDamage: level => 2 + (level * 0.01), // Crit multiplier
      bleedChance: level => level * 0.002         // DOT chance
    },
    
    abilities: {
      trained: 'Quick Strikes - Double tap for combo',
      specialized: 'Assassinate - First hit always crits',
      mastery: 'Shadow Dance - 5 seconds of guaranteed crits'
    },
    
    visualEffect: 'Purple shadow trails, quick slashes'
  },
  
  FINESSE_WEAPONS: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    weapons: ['Rapier', 'Spear', 'Staff'],
    
    effects: {
      accuracy: level => 0.8 + (level * 0.001),   // Hit chance
      criticalChance: level => 0.1 + (level * 0.001), // Crit rate
      counterChance: level => level * 0.001       // Counter attack
    },
    
    abilities: {
      trained: 'Riposte - Counter attacks on dodge',
      specialized: 'Perfect Strike - Cannot miss for 10 taps',
      mastery: 'Flawless Technique - All attacks are perfect'
    },
    
    visualEffect: 'Blue precision marks, elegant sweeps'
  },
  
  MISSILE_WEAPONS: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    weapons: ['Bow', 'Crossbow', 'Atlatl'],
    
    effects: {
      range: level => 1 + (level * 0.01),         // Auto-attack range
      pierceDamage: level => 1 + (level * 0.015), // Armor ignore
      multishot: level => 1 + Math.floor(level/50) // Extra projectiles
    },
    
    abilities: {
      trained: 'Aimed Shot - Hold for precision damage',
      specialized: 'Rain of Arrows - Hit all enemies on screen',
      mastery: 'Phantom Arrows - Shots pierce through enemies'
    },
    
    visualEffect: 'Arrow trails, target reticles'
  },
  
  // DEFENSE SKILLS
  MELEE_DEFENSE: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    effects: {
      dodgeChance: level => 0.05 + (level * 0.001), // Avoid melee
      damageReduction: level => level * 0.5,        // Flat reduction
      counterWindow: level => 100 + (level * 2)     // Counter timing ms
    },
    
    abilities: {
      trained: 'Evasion - 10% dodge chance',
      specialized: 'Deflection - Redirect damage to nearby enemies',
      mastery: 'Untouchable - Immune to melee for 3s'
    },
    
    visualEffect: 'Dodge blur, deflection sparks'
  },
  
  SHIELD: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    requirement: 'Equipped shield',
    
    effects: {
      blockChance: level => 0.1 + (level * 0.002),  // Block rate
      blockValue: level => 0.3 + (level * 0.003),   // Damage blocked %
      shieldBash: level => level * 2                // Bash damage
    },
    
    abilities: {
      trained: 'Shield Wall - Block next 3 attacks',
      specialized: 'Shield Bash - Stun enemy on block',
      mastery: 'Aegis - Party-wide damage reduction'
    },
    
    visualEffect: 'Shield glow, impact ripples'
  },
  
  // MAGIC SKILLS
  WAR_MAGIC: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    requirement: 'Focus >= 20',
    manaCost: level => 10 + level,
    
    effects: {
      spellDamage: level => 10 + (level * 2),       // Base spell damage
      elementalBonus: level => 1 + (level * 0.01),  // Elemental multiplier
      chainChance: level => level * 0.001           // Chain lightning
    },
    
    spells: {
      trained: {
        'Flame Bolt': { damage: 'level * 5', element: 'fire' },
        'Frost Bolt': { damage: 'level * 5', element: 'cold' },
        'Shock Wave': { damage: 'level * 5', element: 'lightning' }
      },
      specialized: {
        'Ring of Fire': { damage: 'level * 10', aoe: true },
        'Blizzard': { damage: 'level * 10', slow: true },
        'Chain Lightning': { damage: 'level * 10', chain: 3 }
      },
      mastery: {
        'Apocalypse': { damage: 'level * 50', screenClear: true }
      }
    },
    
    visualEffect: 'Spell circles, elemental explosions'
  },
  
  LIFE_MAGIC: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    requirement: 'Self >= 20',
    
    effects: {
      healPower: level => 10 + (level * 2),         // Healing amount
      buffDuration: level => 10 + (level * 0.5),    // Buff length
      resurrectChance: level => level * 0.001       // Auto-revive
    },
    
    spells: {
      trained: {
        'Heal Self': { heal: 'level * 5' },
        'Regeneration': { hot: 'level * 1', duration: 10 }
      },
      specialized: {
        'Greater Heal': { heal: 'level * 20' },
        'Blessing': { allStats: '+10', duration: 60 }
      },
      mastery: {
        'Divine Protection': { invulnerable: 5 }
      }
    },
    
    visualEffect: 'Green healing particles, holy light'
  },
  
  // SPECIAL SKILLS
  DUAL_WIELD: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    requirement: 'Coordination >= 30',
    
    effects: {
      offhandDamage: level => 0.3 + (level * 0.003), // Offhand %
      attackRate: level => 1.2 + (level * 0.003),    // Speed bonus
      comboChance: level => level * 0.002            // Double strike
    },
    
    abilities: {
      trained: 'Twin Strike - Both weapons hit',
      specialized: 'Whirling Blades - Continuous damage aura',
      mastery: 'Perfect Ambidexterity - Full damage both hands'
    },
    
    visualEffect: 'Dual weapon trails, crossed slashes'
  },
  
  TWO_HANDED_COMBAT: {
    trained: false,
    specialized: false,
    level: 0,
    maxLevel: 226,
    
    requirement: 'Strength >= 30',
    
    effects: {
      damageMultiplier: level => 1.5 + (level * 0.005), // Big damage
      cleaveRadius: level => 1 + (level * 0.01),        // AOE size
      executionThreshold: level => 0.1 + (level * 0.001) // Instant kill %
    },
    
    abilities: {
      trained: 'Mighty Swing - Next attack deals 3x damage',
      specialized: 'Cleave - All attacks hit multiple enemies',
      mastery: 'Execution - Instantly kill enemies below 30% HP'
    },
    
    visualEffect: 'Massive swing arcs, ground shakes'
  }
};
```

### 3.2 Skill Training and Progression
```typescript
const skillSystem = {
  // Training costs
  training: {
    untrained_to_trained: {
      cost: 1,  // Skill credits
      requirement: 'Character Level 1'
    },
    trained_to_specialized: {
      cost: 1,  // Additional credit
      requirement: 'Skill Level 50+'
    }
  },
  
  // Skill credits earned
  skillCredits: {
    perLevel: 1,
    fromQuests: ['Drudge Fort', 'Olthoi Lair', 'Gaerlan'],
    fromPortals: 1  // Each prestige grants 1 credit
  },
  
  // Experience distribution
  skillExperience: {
    activeSkill: 0.7,   // 70% to equipped weapon skill
    passiveSkills: 0.3, // 30% split among trained skills
    
    bonusXP: {
      specialized: 2.0,  // Double XP when specialized
      weakness: 1.5,     // Bonus for hitting weaknesses
      perfect: 3.0       // Perfect timing attacks
    }
  },
  
  // Skill synergies
  synergies: {
    'Sword and Board': {
      requires: ['HEAVY_WEAPONS', 'SHIELD'],
      bonus: 'Block triggers counter attack'
    },
    'Spell Blade': {
      requires: ['FINESSE_WEAPONS', 'WAR_MAGIC'],
      bonus: 'Weapons deal elemental damage'
    },
    'Ranger': {
      requires: ['MISSILE_WEAPONS', 'MELEE_DEFENSE'],
      bonus: 'Kiting enemies increases damage'
    }
  }
};
```

---

## 4. Creatures of Dereth (Authentic AC Bestiary)

### 4.1 Creature Tiers and Progression
```typescript
const creatureDatabase = {
  // NEWBIE TIER (Level 1-20)
  newbieDungeon: {
    'Drudge Prowler': {
      level: 1,
      hp: 10,
      damage: 2,
      weakness: 'bludgeon',
      loot: ['Pyreals', 'Crude Lockpick'],
      description: 'A weak drudge, perfect for training'
    },
    'Young Mosswart': {
      level: 3,
      hp: 30,
      damage: 5,
      weakness: 'fire',
      abilities: ['throw_rock'],
      loot: ['Mosswart Hide', 'Swamp Stone']
    },
    'Brown Rabbit': {
      level: 1,
      hp: 5,
      damage: 1,
      speed: 'fast',
      achievement: 'Killer Rabbit - Die to a rabbit',
      loot: ['Lucky Rabbit Foot']
    },
    'Rust Gromnie': {
      level: 5,
      hp: 50,
      damage: 8,
      abilities: ['acid_spit'],
      weakness: 'pierce',
      loot: ['Gromnie Hide', 'Gromnie Tooth']
    }
  },
  
  // LOW TIER (Level 20-50)
  overworldCommon: {
    'Banderling Scout': {
      level: 20,
      hp: 500,
      damage: 20,
      abilities: ['rage', 'throw_boulder'],
      weakness: 'magic',
      loot: ['Banderling Arm', 'Stone Tool']
    },
    'Auroch Bull': {
      level: 25,
      hp: 800,
      damage: 30,
      abilities: ['charge', 'trample'],
      weakness: 'pierce',
      loot: ['Auroch Horn', 'Thick Hide']
    },
    'Skeleton Warrior': {
      level: 30,
      hp: 600,
      damage: 25,
      resistance: 'pierce',
      weakness: 'bludgeon',
      loot: ['Ancient Bone', 'Rusted Sword']
    }
  },
  
  // MID TIER (Level 50-100)
  dangerousWilds: {
    'Lugian Titan': {
      level: 60,
      hp: 5000,
      damage: 100,
      abilities: ['ground_slam', 'rock_throw', 'war_cry'],
      weakness: 'finesse',
      loot: ['Lugian Sinew', 'Titan Heart', 'Rock Hammer']
    },
    'Tusker Guard': {
      level: 70,
      hp: 8000,
      damage: 150,
      abilities: ['tusk_charge', 'stomp', 'thick_hide'],
      weakness: 'pierce',
      loot: ['Tusker Tusk', 'Thick Leather', 'Tusker Paw']
    },
    'Shadow Lieutenant': {
      level: 80,
      hp: 6000,
      damage: 120,
      abilities: ['phase_shift', 'life_drain', 'shadow_bolt'],
      weakness: 'light_magic',
      resistance: 'physical',
      loot: ['Shadow Fragment', 'Dark Essence']
    }
  },
  
  // HIGH TIER (Level 100-150)
  eliteCreatures: {
    'Olthoi Warrior': {
      level: 100,
      hp: 20000,
      damage: 300,
      abilities: ['acid_spray', 'burrow', 'carapace'],
      weakness: 'fire',
      resistance: 'pierce',
      loot: ['Olthoi Claw', 'Acid Gland', 'Olthoi Carapace']
    },
    'Crystal Golem': {
      level: 120,
      hp: 30000,
      damage: 400,
      abilities: ['crystal_shards', 'reflect_magic', 'regenerate'],
      weakness: 'bludgeon',
      resistance: 'magic',
      loot: ['Crystal Shard', 'Golem Heart', 'Prismatic Ore']
    },
    'Virindi Director': {
      level: 140,
      hp: 25000,
      damage: 350,
      abilities: ['mind_blast', 'summon_minions', 'portal_storm'],
      weakness: 'void_magic',
      resistance: 'mental',
      loot: ['Virindi Mask', 'Energy Source', 'Directive Key']
    }
  },
  
  // LEGENDARY BOSSES
  worldBosses: {
    'Olthoi Queen': {
      level: 150,
      hp: 1000000,
      damage: 500,
      sharedHealth: true,  // All players damage same boss
      abilities: ['acid_rain', 'summon_swarm', 'queen_rage', 'burrow_strike'],
      phases: 3,
      loot: ['Queen\'s Heart', 'Olthoi Armor Set', 'Portal Stone x10'],
      respawnTime: 86400  // 24 hours
    },
    'Gaerlan': {
      level: 175,
      hp: 2000000,
      damage: 750,
      sharedHealth: true,
      abilities: ['elemental_storm', 'invulnerability', 'prismatic_blast'],
      phases: 5,
      loot: ['Gaerlan\'s Staff', 'Elemental Stones', 'Master Robe'],
      respawnTime: 604800  // Weekly
    },
    'Bael\'Zharon': {
      level: 200,
      hp: 5000000,
      damage: 1000,
      sharedHealth: true,
      abilities: ['hopeslayer', 'shadow_storm', 'corruption', 'dark_portal'],
      phases: 7,
      loot: ['Hopeslayer Weapon', 'Shadow Armor', 'Dark Heart'],
      respawnTime: 2592000  // Monthly event
    }
  }
};
```

### 4.2 Combat Mechanics
```typescript
const combatSystem = {
  // Weakness/Resistance system from AC
  damageTypes: {
    slash: { strong: ['flesh', 'cloth'], weak: ['armor', 'crystal'] },
    pierce: { strong: ['armor', 'scales'], weak: ['bone', 'ethereal'] },
    bludgeon: { strong: ['bone', 'crystal'], weak: ['flesh', 'liquid'] },
    fire: { strong: ['ice', 'plant'], weak: ['fire', 'dragon'] },
    cold: { strong: ['fire', 'reptile'], weak: ['ice', 'undead'] },
    acid: { strong: ['armor', 'stone'], weak: ['ooze', 'olthoi'] },
    lightning: { strong: ['metal', 'water'], weak: ['electric', 'crystal'] }
  },
  
  // Combat stance system
  stances: {
    high: { 
      accuracy: 0.9, 
      damage: 1.0, 
      defense: 0.8,
      description: 'Accurate but vulnerable'
    },
    medium: { 
      accuracy: 0.8, 
      damage: 1.2, 
      defense: 0.9,
      description: 'Balanced approach'
    },
    low: { 
      accuracy: 0.7, 
      damage: 1.5, 
      defense: 1.0,
      description: 'Powerful but wild'
    }
  }
};
```

---

## 5. Idle Activities - Living in Dereth

### 5.1 Active Idle System
```typescript
const idleActivities = {
  // INSTANT ACTIONS (Always running)
  autoAttack: {
    frequency: 1000,  // Every second
    damage: () => tapDamage * 0.5,
    visual: 'Weapon swings automatically',
    upgradeable: true
  },
  
  // QUICK ACTIVITIES (5-30 seconds)
  activities: {
    'Drudge Raid': {
      duration: 5000,
      reward: { xp: 'level * 10', pyreals: 'level * 5' },
      description: 'Clear a drudge camp',
      unlockLevel: 1
    },
    'Chest Run': {
      duration: 15000,
      reward: { pyreals: 'level * 20', items: 1 },
      description: 'Search for treasure',
      unlockLevel: 5
    },
    'Portal Hop': {
      duration: 10000,
      reward: { xp: 'level * 25', exploration: 1 },
      description: 'Quick portal jump',
      unlockLevel: 10
    }
  },
  
  // MEDIUM ACTIVITIES (1-5 minutes)
  dungeons: {
    'Drudge Fort': {
      duration: 60000,
      reward: { 
        xp: 'level * 100', 
        pyreals: 'level * 50',
        skillCredit: 0.1  // 10% chance
      },
      description: 'Assault the drudge stronghold',
      unlockLevel: 15
    },
    'Olthoi Lair': {
      duration: 180000,
      reward: { 
        xp: 'level * 500', 
        items: 3,
        olthoiTokens: 1
      },
      description: 'Brave the hive',
      unlockLevel: 50
    },
    'Shadow Spire': {
      duration: 300000,
      reward: { 
        xp: 'level * 1000', 
        shadowFragments: 5,
        legendaryChance: 0.01
      },
      description: 'Climb the dark tower',
      unlockLevel: 100
    }
  },
  
  // LONG ACTIVITIES (5+ minutes)
  quests: {
    'Aerlinthe Island': {
      duration: 600000,  // 10 minutes
      reward: { 
        xp: 'level * 2000',
        ashensRobe: 0.01,  // 1% chance
        majorPyreals: 1000
      },
      description: 'Journey to Aerlinthe',
      unlockLevel: 125
    },
    'Gaerlan\'s Citadel': {
      duration: 900000,  // 15 minutes
      reward: { 
        xp: 'level * 5000',
        elementalWeapon: 0.05,
        portalStone: 1
      },
      description: 'Face the Elemental Master',
      unlockLevel: 150
    }
  }
};
```

### 5.2 Town Activities
```typescript
const townServices = {
  'Lifestone Bind': {
    cost: 'level * 100 pyreals',
    effect: 'Set respawn point',
    description: 'Bind your soul to this lifestone'
  },
  
  'Asheron\'s Blessing': {
    cooldown: 86400,  // Daily
    effect: 'All attributes +10 for 1 hour',
    description: 'Receive the Empyrean\'s blessing'
  },
  
  'Marketplace': {
    refreshRate: 3600,  // Hourly
    items: [
      { name: 'Health Potion', cost: 100, effect: 'Instant heal' },
      { name: 'Mana Elixir', cost: 150, effect: 'Restore mana' },
      { name: 'Attribute Gem', cost: 1000, effect: '+1 random attribute' }
    ]
  },
  
  'Tinkering Table': {
    unlockLevel: 30,
    recipes: {
      'Iron to Steel': { 
        materials: ['Iron Bar x10'], 
        result: 'Steel Bar',
        skillRequired: 'ITEM_TINKERING'
      },
      'Imbue Weapon': {
        materials: ['Weapon', 'Elemental Stone'],
        result: 'Elemental Weapon',
        skillRequired: 'WEAPON_TINKERING'
      }
    }
  }
};
```

---

## 6. Portal System - The Asheron's Call Way

### 6.1 Portal Mechanics
```typescript
const portalSystem = {
  // Traditional AC portal colors/types
  portalTypes: {
    purple: {
      name: 'Standard Portal',
      destination: 'Town Network',
      requirement: 'None',
      visual: 'Classic purple swirl'
    },
    blue: {
      name: 'Dungeon Portal',
      destination: 'Specific Dungeon',
      requirement: 'Level appropriate',
      visual: 'Blue energy vortex'
    },
    green: {
      name: 'Lifestone Recall',
      destination: 'Bound Lifestone',
      requirement: 'Lifestone bound',
      visual: 'Green healing spiral'
    },
    red: {
      name: 'PK Portal',
      destination: 'PvP Zone',
      requirement: 'PK Status',
      visual: 'Blood red swirl'
    },
    white: {
      name: 'Asheron\'s Portal',
      destination: 'New Iteration',
      requirement: 'Ready to Prestige',
      visual: 'Brilliant white light'
    }
  },
  
  // Prestige system as portal jumps
  prestigePortal: {
    requirement: {
      level: 100,
      bossKilled: 'Olthoi Queen',
      portalStones: 10
    },
    
    rewards: {
      keepPermanent: {
        skillSpecializations: true,
        attributeBonus: 'level / 10',  // Keep 10% of attributes
        achievementProgress: true
      },
      
      multiplicativeBonus: {
        damage: 'previousMultiplier * 2',
        xpGain: 'previousMultiplier * 1.5',
        pyrealsGain: 'previousMultiplier * 2'
      },
      
      newContent: {
        creatures: 'Unlock tier 2 variants',
        dungeons: 'Hard mode versions',
        skills: 'Mastery levels unlock'
      }
    },
    
    // The portal jump experience
    sequence: [
      { time: 0, action: 'Screen fades to white' },
      { time: 1000, action: 'Show portal tunnel effect' },
      { time: 2000, action: 'Flash memories of journey' },
      { time: 3000, action: 'Emerge in new Dereth' },
      { time: 4000, action: 'You have been reborn stronger!' }
    ]
  }
};
```

### 6.2 Portal Ties and Recall
```typescript
const recallSystem = {
  // Classic AC recall system
  primaryTie: {
    spell: 'Primary Portal Tie',
    cost: { mana: 50 },
    setLocation: 'Current position',
    recall: 'Primary Portal Recall',
    visual: 'Blue tie line to location'
  },
  
  secondaryTie: {
    spell: 'Secondary Portal Tie',
    cost: { mana: 75 },
    requirement: 'Level 50+',
    setLocation: 'Current position',
    recall: 'Secondary Portal Recall',
    visual: 'Green tie line to location'
  },
  
  lifestoneTie: {
    automatic: true,
    onUse: 'Bind to lifestone',
    recall: 'Lifestone Recall',
    deathRecall: true,
    visual: 'Silver cord to lifestone'
  },
  
  // Portal gems for instant travel
  portalGems: {
    'Holtburg Gem': { destination: 'Holtburg', cost: 100 },
    'Yaraq Gem': { destination: 'Yaraq', cost: 100 },
    'Shoushi Gem': { destination: 'Shoushi', cost: 100 },
    'Facility Hub Gem': { destination: 'Facility Hub', cost: 500 }
  }
};
```

---

## 7. Loot System - Dereth's Treasures

### 7.1 Item Generation
```typescript
const lootSystem = {
  // AC's material tiers
  materials: {
    weapons: ['Iron', 'Steel', 'Pyreal', 'Atlan', 'Isparian', 'Spectral'],
    armor: ['Leather', 'Studded', 'Chain', 'Plate', 'Celdon', 'Amuli'],
    
    materialBonus: {
      iron: 1.0,
      steel: 1.2,
      pyreal: 1.5,
      atlan: 2.0,
      isparian: 3.0,
      spectral: 5.0
    }
  },
  
  // Magical properties (Tinkering)
  enchantments: {
    prefixes: {
      'Flaming': { damage: 'fire', bonus: 1.2 },
      'Frozen': { damage: 'cold', bonus: 1.2 },
      'Sparking': { damage: 'lightning', bonus: 1.2 },
      'Acidic': { damage: 'acid', bonus: 1.2 },
      'Phantom': { penetration: 0.5, bonus: 1.3 },
      'Blessed': { holy: true, bonus: 1.5 }
    },
    
    suffixes: {
      'of Blood': { lifesteal: 0.1 },
      'of Swiftness': { attackSpeed: 1.2 },
      'of Power': { damage: 1.3 },
      'of Defense': { armor: 1.5 },
      'of the Olthoi': { acid: 'immune' },
      'of Asheron': { allStats: 5 }
    }
  },
  
  // Legendary items
  legendaryItems: {
    // Weapons
    'Asheron\'s Staff': {
      rarity: 'Legendary',
      damage: 'level * 100',
      effects: ['All magic skills +50', 'Unlimited mana'],
      lore: 'The staff of the last Empyrean'
    },
    'Atlan Sword': {
      rarity: 'Legendary',
      damage: 'level * 80',
      effects: ['Ignores all armor', 'Fire damage'],
      lore: 'Forged by the master smith Atlan'
    },
    'Singularity Bow': {
      rarity: 'Legendary',
      damage: 'level * 70',
      effects: ['Infinite arrows', 'Pierces all enemies'],
      lore: 'Created from Virindi technology'
    },
    
    // Armor
    'Greater Celdon Armor': {
      rarity: 'Legendary',
      armor: 'level * 50',
      effects: ['50% damage reduction', 'Magic resistance'],
      lore: 'The finest armor of ancient Celdon'
    },
    'Virindi Mask': {
      rarity: 'Legendary',
      effects: ['See all weaknesses', 'Mind protection'],
      lore: 'Torn from a Virindi Director'
    },
    
    // Accessories
    'Bracelet of Dark Essence': {
      rarity: 'Legendary',
      effects: ['All attributes +10', 'Shadow form'],
      lore: 'Infused with shadow essence'
    }
  }
};
```

---

## 8. User Interface - Classic AC with Modern Polish

### 8.1 Main Screen Layout
```
┌────────────────────────────────────────────┐
│ [PORTRAIT] Lv.42 Hero of Dereth           │ <- Character info
│ HP: ████████░░ 180/200  MP: ███░░░ 30/50  │ <- Vital bars
│ STR:25 END:30 CRD:22 QCK:18 FOC:35 SLF:20 │ <- Attributes
├────────────────────────────────────────────┤
│                                            │
│         [CREATURE MODEL]                   │ <- 35% of screen
│         Olthoi Warrior                     │
│         ████░░░░░░░░ 12,450/50,000 HP     │
│         Weakness: 🔥 Fire                  │
│                                            │
│    [TAP TO ATTACK - HOLD FOR POWER]       │ <- Main interaction
│         ⚔️ 1,234 damage!                   │
│         💰 +45 Pyreals                     │
├────────────────────────────────────────────┤
│ [⚔️ Skills] [📦 Inventory] [🗺️ Map] [⚙️]    │ <- Navigation
├────────────────────────────────────────────┤
│ Current Activities:                        │
│ ▶ Auto-Attack: ███░ (0.5s)                │
│ ▶ Drudge Raid: █████░░░░░ (12s)           │
│ ▶ Olthoi Lair: ██░░░░░░░░ (2:45)          │
└────────────────────────────────────────────┘
```

### 8.2 Visual Design Language
```typescript
const visualStyle = {
  // AC's color palette
  colors: {
    primary: '#4A3C8C',     // Dereth purple
    secondary: '#8B7355',   // Sandstone brown
    accent: '#FFD700',      // Pyreal gold
    danger: '#8B0000',      // PK red
    success: '#228B22',     // Lifestone green
    magic: '#9370DB',       // Magic purple
    
    damageTypes: {
      slash: '#DC143C',     // Crimson
      pierce: '#FFD700',    // Gold
      bludgeon: '#4682B4',  // Steel blue
      fire: '#FF4500',      // Orange red
      cold: '#00CED1',      // Dark turquoise
      acid: '#32CD32',      // Lime green
      lightning: '#9370DB'  // Medium purple
    }
  },
  
  // UI textures from AC
  textures: {
    background: 'stone_texture.png',
    frames: 'metal_border.png',
    buttons: 'carved_stone.png',
    portraits: 'portrait_frame.png'
  },
  
  // Fonts
  typography: {
    damage: 'Bold medieval font, scales with damage',
    ui: 'Clean readable font with slight medieval flair',
    lore: 'Italic serif for item descriptions'
  },
  
  // Particle effects
  particles: {
    criticalHit: 'Explosion of damage type color',
    levelUp: 'Golden spiral ascending',
    portalOpen: 'Purple/blue swirl',
    lootDrop: 'Item glow and sparkles',
    spellCast: 'Magical circles and runes'
  }
};
```

---

## 10. Achievement & Collection Systems

### 10.1 Achievement System
```typescript
const achievementSystem = {
  // Combat Achievements
  combat: {
    'First Blood': { requirement: 'Kill first creature', reward: '10 Pyreals' },
    'Drudge Slayer': { requirement: 'Kill 100 Drudges', reward: 'Title + 100 XP' },
    'Olthoi Nightmare': { requirement: 'Kill 1000 Olthoi', reward: 'Olthoi Slayer Weapon' },
    'God Killer': { requirement: 'Defeat Bael\'Zharon', reward: 'Legendary Title' },
    'Untouchable': { requirement: '100 kills without damage', reward: 'Dodge +5%' },
    'One Shot Wonder': { requirement: 'One-shot kill level 100+ creature', reward: 'Critical Damage +10%' }
  },
  
  // Progression Achievements
  progression: {
    'Level 10': { requirement: 'Reach level 10', reward: 'Skill Point' },
    'Level 50': { requirement: 'Reach level 50', reward: 'Portal Stone' },
    'Level 100': { requirement: 'Reach level 100', reward: 'Legendary Box' },
    'First Portal': { requirement: 'Complete first prestige', reward: 'Permanent +10% XP' },
    'Portal Master': { requirement: '10 prestiges', reward: 'Unique Portal Effect' },
    'Max Attribute': { requirement: 'Any attribute to 100', reward: 'Attribute Gem' }
  },
  
  // Collection Achievements
  collection: {
    'Packrat': { requirement: 'Collect 100 items', reward: 'Inventory +10' },
    'Legendary Hunter': { requirement: 'Find 10 legendary items', reward: 'Luck +5%' },
    'Fashion Conscious': { requirement: 'Collect all armor sets', reward: 'Cosmetic Options' },
    'Lore Master': { requirement: 'Find all lore books', reward: 'XP Bonus +25%' }
  },
  
  // Secret Achievements
  hidden: {
    'Death by Rabbit': { requirement: 'Die to a rabbit', reward: 'Title: Rabbit Bait' },
    'Speed Demon': { requirement: '1000 taps in 60 seconds', reward: 'Attack Speed +10%' },
    'Idle Master': { requirement: 'Don\'t tap for 1 hour, still progress', reward: 'Idle Efficiency +20%' },
    'Lucky Seven': { requirement: 'Get 7 legendaries in one day', reward: 'RNG Blessing' }
  }
};
```

### 10.2 Collection Systems
```typescript
const collectionSystems = {
  // Creature Codex
  creatureCodex: {
    purpose: 'Track all creatures encountered',
    
    entries: {
      basic: ['Name', 'Level', 'HP', 'Weakness'],
      advanced: ['Loot table', 'Spawn locations', 'Lore'],
      mastery: ['Perfect kill strategy', 'Speed records']
    },
    
    rewards: {
      '10 Entries': 'Assess Creature +10%',
      '50 Entries': 'Damage vs studied creatures +5%',
      '100 Entries': 'Title: Monster Scholar',
      'Complete': 'Legendary Hunter\'s Spear'
    }
  },
  
  // Item Collections
  itemSets: {
    'Atlan Weapons': {
      items: ['Atlan Sword', 'Atlan Axe', 'Atlan Mace', 'Atlan Bow'],
      setBonus: 'All elemental damage +25%',
      display: 'Trophy room in UI'
    },
    'Shadow Armor': {
      items: ['Shadow Helm', 'Shadow Chest', 'Shadow Legs', 'Shadow Boots'],
      setBonus: 'Damage reduction 50%',
      visual: 'Character appearance changes'
    },
    'Olthoi Trophies': {
      items: ['Olthoi Claw', 'Queen\'s Heart', 'Acid Gland', 'Carapace Shield'],
      setBonus: 'Acid immunity',
      achievement: 'Olthoi Bane'
    }
  },
  
  // Lore Books
  loreCollection: {
    books: [
      { name: 'The Fall of Asheron', location: 'Asheron\'s Tower' },
      { name: 'Olthoi Invasion Records', location: 'Abandoned Mine' },
      { name: 'Virindi Experiments', location: 'Research Facility' },
      { name: 'The Empyrean Legacy', location: 'Ancient Ruins' }
    ],
    
    rewards: {
      eachBook: 'XP + Lore Points',
      complete: 'Title: Lore Master + Asheron\'s Blessing'
    }
  }
};
```

---

## 11. Events and Seasonal Content

### 11.1 Monthly Events (AC Tradition)
```typescript
const monthlyEvents = {
  // Based on AC's monthly patch tradition
  'Thorns of the Hopeslayer': {
    month: 'January',
    content: {
      boss: 'Bael\'Zharon Avatar',
      quest: 'Stop the Shadow Invasion',
      rewards: ['Shadow Armor', 'Hopeslayer Title']
    }
  },
  
  'Festivus': {
    month: 'December',
    content: {
      activities: ['Gift Exchange', 'Snowball Fight'],
      decorations: 'Snow in towns',
      rewards: ['Festive Weapons', 'Santa Gumdrop']
    }
  },
  
  'Remembering the Past': {
    month: 'November',
    content: {
      retrospective: 'Visit AC memorial sites',
      rewards: ['Veteran rewards', 'Classic skins'],
      community: 'Share AC memories for bonuses'
    }
  }
};
```

### 11.2 World Events
```typescript
const worldEvents = {
  // Dynamic events affecting all players
  'Olthoi Invasion': {
    trigger: 'Random or scheduled',
    duration: 72,  // Hours
    
    phases: [
      { name: 'Scouts', spawns: 'Olthoi Scouts everywhere' },
      { name: 'Warriors', spawns: 'Olthoi Warriors in towns' },
      { name: 'Queen', spawns: 'Queen appears for final battle' }
    ],
    
    participation: {
      damage: 'Track total damage dealt',
      rewards: 'Based on contribution',
      leaderboard: 'Top 100 get special rewards'
    }
  },
  
  'Portal Storms': {
    frequency: 'Weekly',
    effect: 'Random portals appear',
    destinations: 'Rare dungeons or loot rooms',
    duration: 60  // Minutes
  },
  
  'Asheron\'s Call': {
    frequency: 'Monthly',
    requirement: 'Community goal met',
    reward: 'Asheron appears and grants boons',
    blessing: 'Server-wide 2x XP for 24 hours'
  }
};
```

---

## 12. Technical Implementation

### 12.1 Architecture
```typescript
const technicalStack = {
  frontend: {
    framework: 'React Native / Expo',
    state: 'Redux or Zustand',
    animations: 'Reanimated 3',
    particles: 'Skia or custom WebGL'
  },
  
  backend: {
    api: 'Node.js / Express',
    database: 'PostgreSQL for players, Redis for sessions',
    realtime: 'WebSockets for world events',
    cdn: 'CloudFlare for assets'
  },
  
  performance: {
    targetFPS: 60,
    batteryLife: '< 3% drain per 10 minutes',
    bundleSize: '< 50MB initial',
    assetLoading: 'Progressive with gameplay'
  }
};
```

### 12.2 Anti-Cheat and Security
```typescript
const security = {
  clientValidation: {
    actions: 'Validate all on server',
    timing: 'Server authoritative',
    state: 'Never trust client'
  },
  
  antiCheat: {
    detection: [
      'Impossible tap rates',
      'Modified game files',
      'Time manipulation',
      'Automated clicking patterns'
    ],
    
    response: {
      warning: 'First offense',
      temporaryBan: 'Second offense',
      permanentBan: 'Third offense'
    }
  },
  
  economy: {
    monitoring: 'Track unusual wealth gains',
    limits: 'Daily transaction limits',
    verification: 'Large purchases require confirm'
  }
};
```

---

## 13. Development Phases

### 13.1 Build Plan
```typescript
const developmentPhases = {
  phase1_core: {
    duration: '1 week',
    features: [
      'Tap combat mechanic',
      'Basic creatures (Drudge, Mosswart)',
      'Damage numbers and feedback',
      'Level progression',
      'Save system'
    ]
  },
  
  phase2_depth: {
    duration: '2 weeks',
    features: [
      'All 6 attributes',
      'Combat skill system',
      'Idle activities',
      'Offline progression',
      'Basic UI polish'
    ]
  },
  
  phase3_content: {
    duration: '2 weeks',
    features: [
      'Full creature roster',
      'Loot system',
      'Portal/prestige mechanics',
      'Achievement system',
      'Sound and particles'
    ]
  },
  
  phase4_polish: {
    duration: '1 week',
    features: [
      'Balance tuning',
      'Performance optimization',
      'Tutorial flow',
      'Final visual effects',
      'Testing and bug fixes'
    ]
  }
};
```

---

## 14. Post-Launch Content Roadmap

### 14.1 Content Pipeline
```typescript
const contentRoadmap = {
  month1: {
    focus: 'Stability and polish',
    content: 'Bug fixes, QoL improvements'
  },
  
  month2: {
    newFeature: 'Crafting System',
    newCreatures: 5,
    newDungeon: 'Crystal Cave',
    event: 'First World Boss'
  },
  
  month3: {
    newFeature: 'Player Housing',
    expansion: 'New landmass - Marae Lassel',
    newSkills: ['Void Magic', 'Summoning']
  },
  
  month6: {
    majorUpdate: 'PvP Darktide Server',
    newPrestigeTier: 'Enlightenment',
    raidContent: 'Gaerlan\'s Citadel Raid'
  },
  
  year1: {
    celebration: 'Anniversary Event',
    retrospective: 'Year in Review',
    rewards: 'Exclusive anniversary items',
    announcement: 'Year 2 roadmap'
  }
};
```

---

## Conclusion

This design document reimagines Asheron's Call as a modern idle game while preserving its soul. By starting with immediate, satisfying gameplay and gradually revealing AC's incredible depth, we create an experience that honors the past while embracing the future.

The game respects both veteran players' nostalgia and new players' expectations. Every system, from the six attributes to the patron-vassal allegiance structure, maintains authenticity while serving engaging idle gameplay.

**Core Success Factors:**
1. **Instant Fun**: Tap a drudge in 2 seconds, feel powerful immediately
2. **Authentic Depth**: All six attributes, combat skills, and AC systems
3. **Respectful Monetization**: 100% free-to-play with optional conveniences
4. **Community Focus**: Allegiance system creates lasting relationships
5. **Living World**: Monthly events continue AC's tradition
6. **Nostalgic Innovation**: Classic AC feel with modern polish

**The Vision**: When someone asks "What game are you playing?" the answer is:
- New Player: "This addictive game where numbers explode and I can't stop tapping!"
- AC Veteran: "It's Asheron's Call reborn - all the depth, all the memories, perfect for mobile."

**Welcome back to Dereth, Hero. Your adventure begins with a single tap.**