# Syndicate (1993) Influences

**Core Concept**: Cyberpunk corporate agents on tactical missions

## Visual Style

### Current
- Cel-shaded 3D with outlines
- Urban environment (lamps, benches, trees)
- Cyberpunk aesthetic implied

### Syndicate Enhancement Ideas

#### Color Palette
- **Darker, moodier** - Rain-slicked streets, neon accents
- **Blue-gray tones** - Corporate coldness
- **Red/orange highlights** - Danger, targets, objectives
- Fog/atmosphere for depth and mood

#### Environment
- More urban density (buildings, not just trees)
- Neon signs, holographic ads
- Rainy weather effect (matches Syndicate vibe)
- Different districts: corporate, slums, industrial

## Mission Structure

### Current State
- Open level with patrolling guards
- No clear objectives yet

### Syndicate-Inspired Missions

#### Mission Types
1. **Assassination** - Eliminate target, avoid detection
2. **Extraction** - Rescue/kidnap target, escort out
3. **Persuade** - Convert civilians/enemies to your side (classic Syndicate!)
4. **Data Theft** - Infiltrate, hack terminal, escape
5. **Territory Control** - Capture zones, defend points

#### Mission Structure
```javascript
mission: {
  type: 'assassination',
  objectives: [
    { id: 1, type: 'infiltrate', status: 'active' },
    { id: 2, type: 'eliminate', target: 'guard-3', status: 'pending' },
    { id: 3, type: 'exfiltrate', status: 'pending' }
  ],
  timeLimit: 300, // seconds
  alertLevel: 0-100
}
```

#### Briefing Screen
- Top-down map overview before mission
- Target locations marked
- Patrol routes shown
- Entry/exit points highlighted

## Agent System

### Syndicate's "Persuadertron" Concept
Rather than killing everyone, convert them to your side - very unique mechanic!

#### Agent Abilities
```javascript
player: {
  // Stats
  health: 100,
  energy: 100, // For abilities
  
  // Augmentations (Deus Ex + Syndicate)
  augments: {
    persuasion: { level: 1, cooldown: 30 }, // Convert enemies
    cloaking: { level: 0, duration: 10 },
    legs: { level: 1, speedBoost: 1.5 },
    vision: { level: 0, seeThrough: false }
  },
  
  // Equipment
  weapons: ['pistol', 'uzi'],
  items: ['medikit', 'emp-mine']
}
```

#### Upgrade System
- **Credits** earned from missions
- **Research tree** for augments
- **Equipment shop** between missions
- **Team management** - hire/upgrade additional agents?

## Tactical Elements

### Squad Control (Later Phase)
- Command multiple agents (like Syndicate)
- Simple orders: follow, hold, attack
- Top-down view essential for squad tactics

### Persuasion Mechanic
- **Energy-based ability** (cooldown)
- **Line of sight required** 
- **Converted NPCs** follow you or hold position
- **Creates chaos** - enemies fight each other
- Very Syndicate, very Psy-Rogue thematic!

### Alert System
```javascript
alertLevel: 0-100
// 0-25: Unaware
// 25-50: Suspicious (yellow)
// 50-75: Searching (orange)
// 75-100: Combat (red)
```

- Guards communicate (like Deus Ex)
- Sound propagation matters
- Bodies discovered raise alert
- Time to hide and reset alert level

## UI/HUD

### Minimal Cyberpunk HUD
- **Health/Energy bars** (top-left, thin)
- **Minimap** (top-right, Syndicate-style)
- **Objectives list** (left side, compact)
- **Alert meter** (prominent when elevated)
- **Augment cooldowns** (bottom-right)

### Syndicate-Style Minimap
- Top-down tactical view
- Enemy positions (red dots)
- Converted agents (green dots)
- Objectives (yellow markers)
- Your position (blue)

## Mission Flow

1. **Briefing** (top-down map view)
2. **Loadout** (select augments/weapons)
3. **Infiltration** (spawn in level)
4. **Execute** (stealth/action hybrid)
5. **Exfiltrate** (get to extraction point)
6. **Debrief** (credits, rating, upgrades)

## Aesthetic References

### Syndicate (1993)
- Isometric view
- Dark urban environments
- Team of identical agents in black
- Persuade civilians/enemies
- Minigun havoc

### Deus Ex
- Augmentation system
- Multiple approaches (stealth/combat/social)
- Conspiracy storyline
- Choice and consequence

### Oni
- Hand-to-hand combat system
- Female protagonist
- Cyber-Japanese aesthetic
- Combo system

## Initial Implementation Priority

1. ✅ Basic 3rd person movement (done)
2. ✅ Camera system (done)
3. 🎯 **Camera mode switching** (next)
4. 🎯 **Mission objective system**
5. 🎯 **Alert levels**
6. 🎯 **Basic augment: Persuasion**
7. Later: Full upgrade system
8. Later: Multiple agents/squad control

