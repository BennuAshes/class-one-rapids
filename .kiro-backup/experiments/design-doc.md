# Asheron's Call Idler - Fresh Start Design Document V2

## Building From Scratch with Fun-First Principles

### Core Philosophy

Build an addictive idle game first, add Asheron's Call depth second. Every mechanic must deliver immediate satisfaction while building toward long-term engagement.

**Design Mantra:** "Tap for dopamine, idle for progress, return for surprises."

---

## 1. The 5-Second Hook

### 1.1 First Launch Experience

```
App Opens → Portal Animation (1s) → TAP THE DRUDGE! →
Numbers Explode → Gold Rains → Level Up! → MORE DRUDGES APPEAR
```

**No menus. No character creation. Just immediate fun.**

### 1.2 Core Tap Mechanic

```typescript
interface CoreGameplay {
  // The foundation - must feel perfect
  tap: {
    damage: number;              // Starts at 1, scales exponentially
    hitFeedback: {
      numberSize: 'small' | 'medium' | 'large' | 'CRITICAL';
      particleCount: 1-100;      // Based on damage magnitude
      screenShake: 0-10;         // Critical hits shake screen
      sound: 'tap' | 'hit' | 'smash' | 'obliterate';
    };
    combo: {
      window: 2000;              // 2 seconds to maintain
      multiplier: 1-100;         // Builds with consecutive taps
      visualIndicator: 'flame' | 'lightning' | 'void';
    };
  };
}
```

---

## 2. Progression Layers (From Simple to Complex)

### 2.1 Layer 0: Raw Numbers (Seconds)

- **Tap Damage**: 1 → 10 → 100 → 1K → 1M → 1B → 1T...
- **Gold Per Tap**: Damage \* 0.1
- **XP Per Kill**: Creature level \* 10
- **Visual Feedback**: Numbers get BIGGER and MORE COLORFUL

### 2.2 Layer 1: Basic Upgrades (Minutes)

```typescript
const basicUpgrades = {
  sharperSword: {
    cost: (gold) => gold * 10,
    effect: "tapDamage * 2",
    maxLevel: 100,
    unlockAt: { kills: 10 },
  },
  fasterSwing: {
    cost: (gold) => gold * 15,
    effect: "attackSpeed * 1.5",
    maxLevel: 50,
    unlockAt: { kills: 25 },
  },
  autoClicker: {
    cost: (gold) => gold * 100,
    effect: "tapsPerSecond + 1",
    maxLevel: 20,
    unlockAt: { kills: 100 },
  },
};
```

### 2.3 Layer 2: Attributes (Hours)

Simplified from original AC but maintaining flavor:

```typescript
const attributes = {
  STRENGTH: {
    effect: "tapDamage * (1 + level * 0.1)",
    visual: "Red glow around character",
    milestone10: "Unlock: Power Strike (2x damage every 10th tap)",
    milestone50: "Unlock: Berserker Mode (10x damage for 10s)",
    milestone100: "Unlock: ONE PUNCH MODE",
  },
  ENDURANCE: {
    effect: "idleDamage * (1 + level * 0.1)",
    visual: "Green regeneration aura",
    milestone10: "Unlock: Auto-combat continues offline",
    milestone50: "Unlock: Idle speed doubles",
    milestone100: "Unlock: PERPETUAL WARRIOR",
  },
  FOCUS: {
    effect: "goldGain * (1 + level * 0.1)",
    visual: "Golden sparkles on hits",
    milestone10: "Unlock: Lucky strikes (2x gold chance)",
    milestone50: "Unlock: Treasure sense (rare drops)",
    milestone100: "Unlock: MIDAS TOUCH",
  },
};
```

### 2.4 Layer 3: Portal System (Days)

Instead of complex heritage, simple portal jumps:

```typescript
const portalSystem = {
  // Simple prestige that feels amazing
  requirement: "Defeat Olthoi Queen (Level 100 boss)",

  rewards: {
    portalStones: Math.floor(currentLevel / 10),
    permanentMultiplier: {
      damage: previousMultiplier * 2,
      gold: previousMultiplier * 2,
      xp: previousMultiplier * 2,
    },
  },

  visual: {
    effect: "MASSIVE PORTAL ANIMATION",
    sound: "EPIC WHOOSH",
    message: "ENTERING NEW DERETH! POWER RETAINED!",
  },

  // You restart at level 1 but 10x stronger
  feelGood: "Previous max damage: 1M, New starting damage: 100K",
};
```

---

## 3. Idle Mechanics That Respect Time

### 3.1 Active Idle Activities

Not boring timers, but visual progress:

```typescript
const idleActivities = {
  // Always running
  autoSlash: {
    frequency: 1000, // Every second
    damage: tapDamage * 0.5,
    visual: "Sword swings automatically",
  },

  // Quick cycles
  drudgeHunt: {
    duration: 5000, // 5 seconds
    reward: level * 10,
    visual: "Mini drudges spawn and die",
    sound: "Continuous battle sounds",
  },

  // Medium cycles
  dungeonRun: {
    duration: 30000, // 30 seconds
    reward: level * 100,
    lootChance: 0.3,
    visual: "Character runs through dungeon doors",
    completion: "LOOT EXPLOSION",
  },

  // Big moments
  worldBoss: {
    duration: 300000, // 5 minutes
    reward: level * 10000,
    guaranteed: "Legendary item",
    visual: "Epic boss health bar at top",
    community: "All players damage same boss",
  },
};
```

### 3.2 Offline Progress That Feels Generous

```typescript
function calculateOfflineRewards(secondsAway: number) {
  const rewards = {
    gold: idleGoldPerSecond * secondsAway * 0.7, // 70% efficiency
    xp: idleXpPerSecond * secondsAway * 0.7,
    creatures: Math.floor(secondsAway / 5), // Kills accumulated

    // Bonus events
    events: generateRandomEvents(secondsAway),
    // "Found a Pyreal Mote!"
    // "Defeated a Banderling Chief!"
    // "Discovered Hidden Chest!"

    // Welcome back bonus
    returnBonus:
      secondsAway > 3600
        ? {
            type: "SPEED BOOST",
            duration: 600, // 10 minutes of 2x speed
            message: "Welcome back, hero!",
          }
        : null,
  };

  return rewards;
}
```

---

## 4. Combat That Feels Impactful

### 4.1 Creature Design

```typescript
const creatureProgression = {
  // Early game - die in 1-3 taps
  drudge: { hp: 10, gold: 1, xp: 1 },
  mosswart: { hp: 30, gold: 3, xp: 3 },
  banderling: { hp: 100, gold: 10, xp: 10 },

  // Mid game - require combos
  lugian: { hp: 1000, gold: 100, xp: 100 },
  tusker: { hp: 10000, gold: 1000, xp: 1000 },

  // Late game - strategic fights
  olthoi: { hp: 1000000, gold: 100000, xp: 100000 },

  // Bosses - community events
  olthoiQueen: {
    hp: 1000000000,
    sharedHp: true, // All players damage same boss
    reward: "Portal Stones + Legendary Gear",
  },
};
```

### 4.2 Loot System

```typescript
const lootSystem = {
  common: {
    chance: 0.5,
    items: ["Worn Sword (+10% damage)", "Old Shield (+5% gold)"],
  },
  rare: {
    chance: 0.1,
    items: ["Atlan Sword (+100% damage)", "Lucky Charm (+50% gold)"],
    visual: "BLUE GLOW ITEM CARD",
  },
  legendary: {
    chance: 0.01,
    items: ["Asheron's Staff (Damage x10)", "Gaerlan's Robe (XP x10)"],
    visual: "FULL SCREEN CELEBRATION",
    sound: "LEGENDARY FANFARE",
    autoShare: "Share your legendary drop!",
  },
};
```

---

## 5. User Interface - Everything Visible, Nothing Hidden

### 5.1 Main Screen Layout

```
┌─────────────────────────────────────┐
│  Gold: 1.5M    XP: 847K    Lv: 42  │ <- Always visible, always updating
├─────────────────────────────────────┤
│                                     │
│         [GIANT CREATURE]            │ <- 40% of screen
│          HP: ████░░░░░░             │ <- Clear health bar
│                                     │
│     [TAP ZONE WITH EFFECTS]        │ <- Particles, numbers flying
│                                     │
├─────────────────────────────────────┤
│ [UPGRADE] [UPGRADE] [UPGRADE]       │ <- Pulse when affordable
│   $100     $1.5K    $25K           │ <- Clear costs
├─────────────────────────────────────┤
│ Activities:                         │
│ ▶ Auto-Battle: ████░░░ (3s)        │ <- Multiple progress bars
│ ▶ Dungeon Run: ██░░░░░ (15s)       │ <- Always something happening
│ ▶ Boss Fight: █░░░░░░░ (4m)        │
└─────────────────────────────────────┘
```

### 5.2 Visual Feedback Hierarchy

```typescript
const visualPriority = {
  critical: {
    screenShake: true,
    particleExplosion: true,
    numberSize: "HUGE",
    color: "RED_ORANGE_GRADIENT",
    sound: "BOOM",
  },
  levelUp: {
    fullScreenFlash: true,
    confetti: true,
    banner: "LEVEL UP!",
    sound: "FANFARE",
  },
  normalHit: {
    smallNumber: true,
    quickFade: true,
    sound: "tap",
  },
};
```

---

## 6. Monetization - Fair and Optional

### 6.1 Core Principle

**The game must be 100% playable and fun without spending.**

### 6.2 Revenue Streams

**Rewarded Ads (Primary)**

- 2x gold for 30 minutes (watch ad)
- Instant activity completion (watch ad)
- Free portal stone (watch ad - daily limit)

**Convenience IAPs**

- Remove ads forever ($4.99)
- Auto-tap while offline ($2.99)
- Double offline earnings ($3.99)
- Starter pack: 1000 gems + legendary item ($0.99) - one time only

**Cosmetics**

- Damage number styles ($1.99)
- Character skins ($2.99)
- Portal effects ($3.99)

**Battle Pass ($9.99/month)**

- Free track: Normal rewards
- Premium: 10x rewards + exclusive Asheron skin

---

## 7. Implementation Phases

### Phase 1: Core Loop (Week 1)

1. Tap to damage mechanic
2. Gold and XP accumulation
3. Basic creature spawning
4. Simple damage upgrades
5. Number formatting and display

### Phase 2: Progression (Week 2)

1. Attribute system (simplified)
2. Offline calculation
3. Multiple creatures
4. Loot drops
5. Save system

### Phase 3: Polish (Week 3)

1. All visual effects
2. Sound implementation
3. Smooth animations
4. Particle systems
5. Screen shake and juice

### Phase 4: Meta Systems (Week 4)

1. Portal/prestige system
2. Daily rewards
3. Achievements
4. Settings and options
5. Tutorial flow

### Phase 5: Monetization (Week 5)

1. Ad integration
2. IAP setup
3. Battle pass system
4. Analytics
5. A/B testing framework

---

## 8. Success Metrics

### Day 1 Retention Target: 40%

- Player completes 100+ taps
- Reaches level 10
- Experiences first upgrade cycle
- Returns for offline rewards

### Day 7 Retention Target: 20%

- Has attempted first portal
- Unlocked 3+ activities
- Engaged with daily rewards
- Made strategic decisions

### Day 30 Retention Target: 10%

- Multiple portal completions
- Active in events
- Possible IAP conversion
- Community engagement

---

## 9. Asheron's Call Integration

### 9.1 Lore as Flavor, Not Barrier

- Creature names and appearances from AC
- Location names in activity descriptions
- Legendary items reference AC lore
- Portal system mirrors AC's portal network
- NO REQUIRED LORE KNOWLEDGE

### 9.2 Visual Identity

- Dereth's color palette (muted fantasy)
- Particle effects match spell schools
- UI uses AC's stone and metal textures
- Font choices echo AC's aesthetic
- Music callbacks to original themes

### 9.3 Nostalgia Moments

- "You have been slain by a rabbit" achievement
- Apartment decoration mini-game
- Olthoi invasion events
- Asheron appearance in special events
- Classic emotes as unlockables

---

## 10. What Makes This Fun

### The Hook

"I tap, numbers explode, I feel powerful immediately."

### The Loop

"Every tap makes me stronger, every second shows progress."

### The Depth

"There's always an optimal build to discover."

### The Surprise

"I never know when I'll get that legendary drop."

### The Community

"We're all fighting this world boss together."

### The Nostalgia

"Hey, I remember that creature from AC!"

---

## Technical Requirements

### Performance Targets

- 60 FPS during normal play
- 30 FPS during intense particle effects
- < 2% battery drain per 10 minutes
- < 50MB initial download
- < 100MB with all assets

### Platform Support

- iOS 12+
- Android 8+
- Web browser version
- Save sync across platforms

### Backend Systems

- Cloud saves
- Leaderboards
- Event system
- Analytics pipeline
- A/B testing framework

---

## Conclusion

This design prioritizes immediate fun while building toward long-term engagement. By starting with the simplest, most satisfying mechanic (tapping for numbers) and gradually layering complexity, we create an experience that hooks players instantly but retains them through depth.

The Asheron's Call theme provides flavor and nostalgia without creating barriers for new players. Every system is designed to deliver dopamine first, strategy second, and always respect the player's time and intelligence.

**The goal: When someone asks "What's that game you're playing?" the answer is "You tap and numbers EXPLODE and it's SO SATISFYING!"**

Not: "It's a complex RPG idle game based on..."

**Fun first. Always.**
