# CAPTCHA System Behavior Implementation

## Overview
The captcha system has been updated to implement the following behavior:

### Requirements Implemented

1. **Force players to play each captcha type before starting**
   - Players must complete at least one instance of each registered captcha type
   - The system tracks which types have been solved
   - New captchas are always of unsolved types (if available)

2. **On captcha failure**
   - A new captcha window opens (different type if possible)
   - The failed captcha is discarded and replaced

3. **On premature success** (success without having solved all types)
   - An alert is shown: "There was an issue verifying that you are human. Please solve the remaining CAPTCHAs."
   - Progress indicator shows: `Current/Total` types solved
   - A new captcha spawns automatically (unsolved type)

4. **On completion** (all captcha types solved)
   - Player is allowed to proceed to the game
   - "Start Game" button becomes enabled
   - Game navigation occurs

## Changes Made

### 1. `useCaptchaManager.js`

**New Functions:**
- `getRandomUnsolvedCaptchaType(solvedSet)` - Returns a random captcha type that hasn't been solved yet

**New Methods in Composable:**
- `markCaptchaSolved(captchaType)` - Marks a captcha type as solved
- `isCaptchaSolved(captchaType)` - Checks if a type is solved
- `getAllCaptchaTypes()` - Gets all registered captcha types
- `areAllCaptchasSolved` - Computed property: true if all types are solved
- `getSolvedCaptchasCount` - Computed property: number of solved types
- `getTotalCaptchasCount` - Computed property: total number of types

**Updated Logic:**
- `addPopup()` now uses `getRandomUnsolvedCaptchaType()` to avoid duplicate types
- `solvedCaptchas` - New `Set` to track solved captcha types
- `reset()` - Now clears the `solvedCaptchas` set

### 2. `game.vue`

**New Function:**
- `initializeCaptchas()` - Spawns the first captcha on page load

**Updated Hooks:**
- `onMounted()` - Automatically initializes captchas when page loads (forcing the player to solve them)

**Updated Handler:**
- `onCaptchaVerified(popupId)` - Now:
  - Marks the solved captcha type as solved
  - Checks if ALL types are solved using `areAllCaptchasSolved`
  - If not all solved: shows alert with progress and spawns new captcha
  - If all solved: proceeds to real game

- `onCaptchaSpawnNew(popupId)` - Spawns new unsolved captcha on failure

**Updated Template:**
- Progress indicator: Shows `Current/Total` captcha types solved
- "Start Game" button: 
  - Disabled until all types are solved
  - Text changes to "Complete CAPTCHAs First" when disabled
  - Only enables when `areAllCaptchasSolved` is true

## Flow Diagram

```
Page Load
    ↓
Player forced to solve captcha
    ↓
Solve Captcha
    ├─ Fail → Spawn new (different type) → Repeat
    └─ Success
        ├─ Not all types solved → Show alert + spawn new → Repeat
        └─ All types solved → Enable "Start Game" button → Can proceed
```

## Technical Details

### Captcha Type Selection
When spawning a new captcha:
1. If a captcha type is specified, use that
2. Otherwise, use `getRandomUnsolvedCaptchaType(solvedCaptchas.value)`
3. This ensures variety and forces completion of all types

### State Tracking
- `solvedCaptchas` is a `Set<string>` containing captcha type names (e.g., "Images", "TicTacToe", etc.)
- Persists until `reset()` is called
- Independent for each game session

### User Feedback
- Progress shown as "CAPTCHA Progress: X/Y types solved"
- Alert message includes both the reason ("issue verifying") and progress count
- Button state clearly indicates if more captchas are needed

## Testing Checklist

- [ ] Page loads → first captcha appears automatically
- [ ] Fail captcha → new captcha spawns (different type)
- [ ] Succeed captcha → if not all types: alert shows, progress displayed, new captcha spawns
- [ ] Succeed final type → allowed to proceed to real game
- [ ] "Start Game" button disabled until all types complete
- [ ] Progress counter updates correctly (e.g., 1/6, 2/6, etc.)
- [ ] Each captcha type appears at least once
