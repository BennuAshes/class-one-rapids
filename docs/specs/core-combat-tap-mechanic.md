# Core Combat Tap Mechanic

## Feature Overview
Implement the fundamental tap-based combat system that forms the core gameplay loop of Asheron's Call Idler. This is the primary interaction point between player and game, requiring exceptional polish and game feel.

## Key Requirements
- Single tap interaction on enemy target areas
- Enemy weakness spot highlighting system
- Satisfying hit feedback with visual and audio responses
- Damage calculation based on Power attribute
- Combo system for successful weakness exploitation
- Enemy health bars with damage number display
- Pyreal (currency) drops on enemy defeat

## Technical Scope
- Touch/click input handling with responsive hit detection
- Particle system for impact effects
- Screen shake and enemy deformation animations
- Scalable damage number display system
- Audio engine integration for dynamic sound effects
- Enemy state management (health, stance, weakness)
- Basic loot drop and auto-collection system

## Success Criteria
- Tap response time under 100ms
- Visceral feedback that makes players "involuntarily smile"
- Clear visual communication of weakness spots
- Satisfying damage escalation with combo multipliers
- Polish level that makes the mechanic fun even without additional features

## Dependencies
- Game engine setup (React Native + Expo)
- Asset pipeline for sprites/animations
- Audio system for sound effects
- Basic UI framework for health bars and damage numbers

## Priority
**CRITICAL** - This is the foundation of the entire game. No other features should be developed until this core mechanic feels exceptional. As stated in the MVP: "The game can be fun in a gray box with just tapping and numbers."