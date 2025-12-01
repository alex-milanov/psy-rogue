# Dynamic Music & Audio System Design

*Date: 2025-12-01*

## Core Concept

Adaptive music system that responds to gameplay state, similar to Syndicate's tension-based soundtrack with Deus Ex's atmospheric depth.

## Music Layers / States

### State 1: Ambient / Exploration
**When**: Safe zone or no nearby threats  
**Mood**: Cyberpunk atmosphere, world-building  
**Characteristics**:
- Slow tempo (80-100 BPM)
- Minimal percussion
- Synth pads, ambient textures
- Melodic elements sparse
- Room for environmental sounds

**Inspiration**: 
- Deus Ex: Human Revolution - "Icarus" main theme (ambient sections)
- Syndicate (1993) - Menu/briefing music
- Blade Runner soundtrack atmosphere

**Example Approach**:
- Base layer: Atmospheric pad (playing continuously)
- Occasional melodic phrases
- Environmental integration (wind, distant city sounds)

### State 2: Tension / Nearby Danger
**When**: Guards in proximity but not alerted  
**Mood**: Cautious, sneaking, heightened awareness  
**Characteristics**:
- Tempo increases slightly (100-120 BPM)
- Subtle percussion enters
- Bassline becomes more prominent
- Staccato elements (danger cues)
- Filtered/processed sounds

**Inspiration**:
- Syndicate - Mission music (not in combat)
- Deus Ex - "UNATCO" stealth sections
- MGS V - Infiltration themes

**Example Approach**:
- Ambient layer continues (filtered/darker)
- Add rhythmic pulse layer
- Introduce tension strings/synths
- Occasional "danger" stings

### State 3: Alert / Combat
**When**: Guards alerted, pursuing player  
**Mood**: Intense, urgent, active  
**Characteristics**:
- Fast tempo (130-150 BPM)
- Full drum kit / electronic percussion
- Aggressive synths
- Driving bassline
- Short, punchy melodic phrases

**Inspiration**:
- Syndicate - Combat music (iconic!)
- Deus Ex: Human Revolution - Boss themes
- Hotline Miami - Action tracks

**Example Approach**:
- All layers active
- Heavy percussion/drums
- Aggressive lead synths
- No subtlety - you're in trouble!

## Dynamic Music in Inspirations

### Syndicate (1993)
**How it works**:
- Distinct tracks for each state
- Hard cuts between states (90s style)
- Combat music is VERY recognizable
- Creates strong gameplay feedback

**What we can learn**:
- Clear state differentiation
- Combat music as reward/punishment
- Iconic sounds = memorable moments

**Listen**: 
- "Data Jack" - Combat
- "Surfing the Datastream" - Mission
- YouTube: "Syndicate OST"

### Deus Ex (2000)
**How it works**:
- Ambient most of the time
- Tension music in dangerous areas
- Combat stings (short bursts)
- Returns to ambient after

**What we can learn**:
- Subtlety in transitions
- Music as environment, not just feedback
- Silence can be powerful

**Listen**:
- "UNATCO" - Main theme
- "Battery Park" - Ambient
- YouTube: "Deus Ex OST"

### Deus Ex: Human Revolution (2011)
**How it works**:
- Layered stems (can mix/match)
- Smooth transitions between states
- Hub music vs mission music
- Boss themes are distinct

**What we can learn**:
- Modern adaptive music techniques
- Seamless state transitions
- Each area has identity

**Listen**:
- "Icarus" - Main theme
- "Hengsha Daylight" - Hub
- "Typhoon" - Combat
- YouTube: "Deus Ex HR OST"

### Deus Ex: Mankind Divided (2016)
**How it works**:
- Even more layered approach
- Vertical mixing (layers)
- Horizontal sequencing (sections)
- Context-aware transitions

**What we can learn**:
- Peak adaptive music implementation
- Emotional range in cyber world

**Listen**:
- "Icarus Rising" - Main theme
- "Golem City" - Ambient
- YouTube: "Deus Ex MD OST"

## Implementation Strategy

### Phase 1: Simple State Switching (MVP)
**Effort**: 1-2 hours  
**Approach**: 3 separate tracks, switch based on game state

```javascript
// In services/audio or services/game
const musicStates = {
  ambient: 'assets/music/ambient.ogg',
  tension: 'assets/music/tension.ogg',
  combat: 'assets/music/combat.ogg'
};

let currentTrack = null;
let currentState = 'ambient';

const setMusicState = (newState) => {
  if (newState === currentState) return;
  
  // Fade out current
  if (currentTrack) {
    currentTrack.fadeOut(1000); // 1 second fade
  }
  
  // Load and fade in new
  currentTrack = new Audio(musicStates[newState]);
  currentTrack.loop = true;
  currentTrack.volume = 0;
  currentTrack.play();
  currentTrack.fadeIn(1000);
  
  currentState = newState;
};

// In game loop
const updateMusicState = (state) => {
  const nearbyGuards = state.game.guards.filter(g => 
    distance(g.position, state.player.position) < 30
  );
  
  if (state.game.mission.alertLevel === 2) {
    setMusicState('combat');
  } else if (nearbyGuards.length > 0) {
    setMusicState('tension');
  } else {
    setMusicState('ambient');
  }
};
```

**Pros**: Simple, immediate feedback  
**Cons**: Abrupt transitions, no subtlety

### Phase 2: Layered Stems (Better)
**Effort**: 4-6 hours  
**Approach**: Multiple audio layers, crossfade between them

**Music Structure**:
- **Layer 1**: Ambient pad (always playing)
- **Layer 2**: Percussion (fades in for tension)
- **Layer 3**: Bass (fades in for tension)
- **Layer 4**: Lead synth (fades in for combat)
- **Layer 5**: Drums (fades in for combat)

```javascript
const musicLayers = {
  ambient: new Audio('ambient-pad.ogg'),
  percussion: new Audio('percussion.ogg'),
  bass: new Audio('bass.ogg'),
  lead: new Audio('lead-synth.ogg'),
  drums: new Audio('drums.ogg')
};

// All tracks play in sync, volume controls mix
Object.values(musicLayers).forEach(layer => {
  layer.loop = true;
  layer.play();
});

const setLayerVolumes = (state) => {
  switch(state) {
    case 'ambient':
      musicLayers.ambient.volume = 0.7;
      musicLayers.percussion.volume = 0;
      musicLayers.bass.volume = 0;
      musicLayers.lead.volume = 0;
      musicLayers.drums.volume = 0;
      break;
    case 'tension':
      musicLayers.ambient.volume = 0.5;
      musicLayers.percussion.volume = 0.6;
      musicLayers.bass.volume = 0.5;
      musicLayers.lead.volume = 0;
      musicLayers.drums.volume = 0;
      break;
    case 'combat':
      musicLayers.ambient.volume = 0.3;
      musicLayers.percussion.volume = 0.8;
      musicLayers.bass.volume = 0.8;
      musicLayers.lead.volume = 0.7;
      musicLayers.drums.volume = 0.9;
      break;
  }
};
```

**Pros**: Smooth transitions, layered depth  
**Cons**: All tracks must be same length/tempo/key, more complex

### Phase 3: Adaptive Music System (Advanced)
**Effort**: 1-2 weeks  
**Approach**: Use Web Audio API or Howler.js for full control

**Features**:
- Beat-matched transitions (only switch on beat)
- Crossfading with EQ filtering
- Dynamic tempo adjustment
- Horizontal and vertical mixing

**Libraries**:
- **Howler.js** - Easy to use, good for games
  https://howlerjs.com/
  
- **Tone.js** - More powerful, music-focused
  https://tonejs.github.io/

- **Web Audio API** - Raw power, steep learning curve
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## Audio Implementation Details

### Music State Triggers

**State Machine**:
```javascript
const getMusicState = (gameState) => {
  // Priority: Combat > Tension > Ambient
  
  if (gameState.game.mission.alertLevel === 2) {
    return 'combat';
  }
  
  // Check guard proximity
  const nearbyGuards = gameState.game.guards.filter(guard => {
    const distance = Math.sqrt(
      Math.pow(guard.position[0] - gameState.player.position[0], 2) +
      Math.pow(guard.position[2] - gameState.player.position[2], 2)
    );
    return distance < 30; // 30 units = danger zone
  });
  
  if (nearbyGuards.length > 0) {
    // Check if any guard is looking toward player
    const guardLooking = nearbyGuards.some(guard => {
      // Calculate if player is in guard's FOV
      return isInFieldOfView(guard, gameState.player);
    });
    
    if (guardLooking) {
      return 'tension'; // Immediate danger
    } else {
      return nearbyGuards.length > 1 ? 'tension' : 'ambient';
    }
  }
  
  return 'ambient';
};
```

### Transition Timing

**Instant transitions**:
- Ambient → Combat (alarm raised)
- Combat → Ambient (escaped, long cooldown)

**Gradual transitions** (2-4 seconds):
- Ambient → Tension (guards nearby)
- Tension → Ambient (guards leaving)
- Tension → Combat (detected)
- Combat → Tension (searching for player)

### Music Parameters

```javascript
state.audio = {
  musicState: 'ambient',
  volume: {
    master: 0.8,
    music: 0.7,
    sfx: 0.9
  },
  transitionDuration: 2000, // ms
  layerVolumes: {
    ambient: 0.7,
    percussion: 0,
    bass: 0,
    lead: 0,
    drums: 0
  }
};
```

## Sound Effects System

### Spatial Audio
**Important for stealth gameplay**

- Footsteps (player and guards)
- Guard radio chatter
- Doors opening/closing
- Alarm sounds
- Gunshots (if combat)

**3D Positional Audio**:
```javascript
// Web Audio API
const audioContext = new AudioContext();
const listener = audioContext.listener;

// Update listener position with player
listener.positionX.value = state.player.position[0];
listener.positionY.value = state.player.position[1];
listener.positionZ.value = state.player.position[2];

// Guard footsteps
guards.forEach(guard => {
  const footstepSound = new Audio('footstep.ogg');
  const source = audioContext.createMediaElementSource(footstepSound);
  const panner = audioContext.createPanner();
  
  panner.positionX.value = guard.position[0];
  panner.positionY.value = guard.position[1];
  panner.positionZ.value = guard.position[2];
  
  source.connect(panner).connect(audioContext.destination);
});
```

### UI Sounds
- Menu navigation
- Objective complete
- Interaction prompts
- Inventory/upgrade selections

### Ambient Sounds
- Wind
- Distant city noise
- Electrical hum
- Rain (if weather system)

## Music Asset Strategy

### Option 1: Commission Original Music
**Pros**: Unique, fits perfectly  
**Cons**: Expensive ($500-2000+ per track)

**Where to find**:
- Fiverr (game music composers)
- r/gameDevClassifieds
- SoundBetter.com

### Option 2: Royalty-Free Music
**Pros**: Affordable, immediate  
**Cons**: Not unique, may sound generic

**Sources**:
- **Incompetech** (Kevin MacLeod) - Free, attribution
  https://incompetech.com/
  
- **Purple Planet** - Free, no attribution
  https://www.purple-planet.com/
  
- **Epidemic Sound** - Subscription ($15/month)
  https://www.epidemicsound.com/
  
- **AudioJungle** - Pay per track ($10-30)
  https://audiojungle.net/

**Search terms**:
- "cyberpunk ambient"
- "stealth game music"
- "tension underscore"
- "electronic combat music"

### Option 3: Create Your Own (Tools)

**Beginner-Friendly**:
- **Bosca Ceoil** - Simple, free, 8-bit focused
  https://boscaceoil.net/
  
- **LMMS** - Free DAW, full-featured
  https://lmms.io/

**Intermediate**:
- **FL Studio** - Popular for electronic music
  https://www.image-line.com/fl-studio/
  
- **Ableton Live** - Great for loops/stems
  https://www.ableton.com/

**Synths for Cyberpunk Sound**:
- **Vital** - Free, powerful wavetable synth
  https://vital.audio/
  
- **Surge XT** - Free, open source
  https://surge-synthesizer.github.io/

### Option 4: Adaptive Music Tools

**Middleware** (for complex adaptive music):
- **FMOD** - Industry standard, free for indie
  https://www.fmod.com/
  
- **Wwise** - Similar to FMOD
  https://www.audiokinetic.com/products/wwise/

**Simpler Approach** (for web):
- **Howler.js** + custom state machine
- **Tone.js** for synthesis

## MVP Audio Roadmap

### Phase 1: Basic Music (Week 1)
- [ ] Find/create 3 music tracks (ambient, tension, combat)
- [ ] Implement simple state switching
- [ ] Hook into game state (guard proximity)
- [ ] Test transitions

### Phase 2: Sound Effects (Week 2)
- [ ] Footstep sounds (player, guards)
- [ ] Interaction sounds (doors, pickups)
- [ ] UI sounds
- [ ] Alarm/alert sounds

### Phase 3: Spatial Audio (Week 3)
- [ ] Implement 3D positional audio
- [ ] Guard footsteps in 3D space
- [ ] Radio chatter from guards
- [ ] Distance-based volume

### Phase 4: Layered Music (Week 4)
- [ ] Split tracks into stems
- [ ] Implement layer mixing
- [ ] Smooth crossfades
- [ ] Beat-matched transitions

## Technical Integration

### Audio Service Structure
```javascript
// services/audio/index.js (already exists, extend it)

const musicSystem = {
  currentState: 'ambient',
  tracks: {},
  layers: {},
  
  init: () => {
    // Load all audio files
    // Set up audio context
  },
  
  update: (gameState) => {
    const newState = getMusicState(gameState);
    if (newState !== this.currentState) {
      this.transition(newState);
    }
  },
  
  transition: (newState) => {
    // Handle crossfading
  }
};

// Hook into game loop
hook({state$, actions}) => {
  state$.subscribe(state => {
    musicSystem.update(state);
  });
};
```

## Testing & Tuning

**Questions to answer through playtesting**:
- Does music reflect danger accurately?
- Are transitions too abrupt or too slow?
- Is combat music motivating or annoying?
- Does music become repetitive?
- Do proximity thresholds feel right?
- Is spatial audio helpful or distracting?

**Parameters to tune**:
- Guard proximity threshold (currently 30 units)
- Transition durations
- Layer volumes in each state
- Combat music trigger sensitivity
- Return-to-ambient delay

## Reference Playlists

### For Inspiration
**Ambient / Exploration**:
- Deus Ex HR - "Hengsha Daylight"
- Blade Runner 2049 - "Sea Wall"
- Ghost in the Shell - "Making of Cyborg"

**Tension / Stealth**:
- Deus Ex - "UNATCO"
- MGS V - "A Phantom Pain"
- Hitman - "Apex Predator"

**Combat / Action**:
- Syndicate (1993) - "Data Jack"
- Hotline Miami - "Hydrogen"
- Cyberpunk 2077 - "Rebel Path"

### Analysis Homework
Listen to these and note:
- How long before music changes?
- What triggers the change?
- How gradual is the transition?
- What makes it feel cyberpunk?

## Next Steps

**This Week**:
1. Listen to Syndicate OST (30 min)
2. Listen to Deus Ex games OSTs (1 hour)
3. Search royalty-free sites for 3 starter tracks
4. Or: Try making simple loop in LMMS/Vital

**Next Week**:
1. Implement basic state switching
2. Hook into guard proximity
3. Test in Liberty Island MVP

Want me to help find specific tracks or implement the basic music state system?


