# Weakness & Critical Hit System

## Overview
Introduce a dynamic weakness spot system that adds skill-based gameplay to the tap mechanic. Players can tap highlighted weak points on enemies for critical damage, creating a more engaging combat experience that rewards precision and timing.

## Core Mechanics

### Weakness Spots
- **Visual Indicator**: A glowing, pulsing circle appears on the enemy
- **Position**: Randomly positioned on the enemy sprite (3-5 possible locations)
- **Duration**: Each weakness spot lasts 2-3 seconds before moving
- **Size**: Large enough for comfortable mobile tapping (60x60 pixels minimum)

### Critical Hit Mechanics
- **Base Critical Multiplier**: 2x damage when hitting weakness spot
- **Miss Penalty**: None - normal damage if you tap outside weakness
- **Success Feedback**:
  - Larger, golden damage numbers
  - Special "CRITICAL!" text above damage
  - Enhanced haptic feedback (Heavy impact)
  - Distinct sound effect

### Progressive Difficulty
- **Level 1-10**: Weakness spots last 3 seconds, move slowly
- **Level 11-25**: Spots last 2.5 seconds, move moderately
- **Level 26+**: Spots last 2 seconds, move quickly

## Visual Design

### Weakness Indicator
- Glowing golden circle with pulsing animation
- Semi-transparent overlay that doesn't obscure enemy
- Smooth transition when moving to new position
- Brief "charging" animation when appearing (0.3 seconds)

### Critical Hit Feedback
- Damage numbers 1.5x larger than normal
- Golden color (#FFD700) with stronger shadow
- "CRITICAL!" text appears above damage number
- Screen flash effect (subtle, 0.1 seconds)

## Combo System Foundation
- **Streak Counter**: Track consecutive critical hits
- **Streak Bonus**: Each consecutive crit adds +10% damage (max 50%)
- **Streak Break**: Missing a weakness spot resets the streak
- **Visual Streak Indicator**: Small counter showing "x2", "x3", etc.

## Balance Considerations

### Risk vs Reward
- Players can choose safe, consistent damage (tap anywhere)
- Or risk waiting for weakness spot for higher damage
- No punishment for normal taps keeps gameplay flowing

### Enemy Health Scaling
- Enemies gain +20% health to compensate for critical damage
- Ensures combat duration remains balanced
- Critical hits feel impactful without trivializing content

## Technical Requirements

### Performance
- Weakness spot rendering must not impact 60 FPS
- Touch detection needs <50ms response time for precision
- Smooth animations using React Native Reanimated 2

### Accessibility
- Option to increase weakness spot size
- Colorblind-friendly indicators (shape + color)
- Audio cue when weakness spot appears
- Vibration pattern distinct from normal hits

## Success Metrics
- 70% of taps should target weakness spots (shows engagement)
- Average critical hit rate: 40-60% (skill-based, not too easy)
- Combo streaks of 5+ achieved by 30% of players
- Session length increase by 2-3 minutes

## Future Expansion Potential
- Different weakness patterns for enemy types
- Special weakness spots that trigger unique effects
- Boss enemies with multiple simultaneous weak points
- Weakness-specific rewards (rare drops from criticals)

## Implementation Priority
This feature builds directly on the existing tap combat system and adds the depth needed to maintain player engagement beyond the initial progression loop. It should be implemented before more complex systems like skills or equipment.