# Quick Wins - Next Features to Implement

Small, achievable features that add big value to the prototype.

## 1. Camera Mode Toggle (1-2 hours)

**Why**: Immediately adds Syndicate/GTA feel, helps with tactical gameplay

```javascript
// Add to actions
toggleCameraMode: () => state => ({
  ...state,
  camera: {
    ...state.camera,
    mode: state.camera.mode === 'third-person' ? 'top-down' : 'third-person'
  }
})
```

- Press **V** key to toggle
- Lerp camera angle from current to 90° (top-down)
- Increase distance to ~80 units
- Update camera service to handle modes

## 2. Simple Objective Display (1 hour)

**Why**: Gives players a goal, feels like a real mission

```javascript
mission: {
  active: true,
  objectives: [
    { text: 'Infiltrate the compound', completed: false },
    { text: 'Avoid detection', completed: false },
    { text: 'Reach extraction point', completed: false }
  ]
}
```

- Show in UI (top-left corner)
- ✓ for completed, • for active
- Simple Snabbdom component

## 3. Alert Level Visualization (30 min)

**Why**: Player needs feedback when guards spot them

```javascript
alertLevel: 0 // 0-100
```

- Color-coded meter or icon
- Guards increment on spotting player
- Decays slowly when hidden
- Changes guard behavior at thresholds

## 4. Minimap (2-3 hours)

**Why**: Essential for tactical play, Syndicate-inspired

- Small 2D canvas (top-right)
- Show player (blue dot)
- Show guards (red dots)
- Show objectives (yellow markers)
- Simple top-down representation

## 5. Basic Augment: Persuasion (2-3 hours)

**Why**: Unique Syndicate mechanic, fun gameplay twist

- Press **E** near enemy
- Energy cost + cooldown
- Enemy becomes friendly (green)
- Follows player or holds position
- Attacks other enemies

## Implementation Order

### Phase 1 (Weekend prototype)
1. Camera mode toggle
2. Objective display
3. Alert level

### Phase 2 (Next sprint)
4. Minimap
5. Persuasion augment
6. Mission complete/fail states

### Phase 3 (Future)
- Weather/atmosphere
- More augments
- Upgrade shop
- Multiple missions

