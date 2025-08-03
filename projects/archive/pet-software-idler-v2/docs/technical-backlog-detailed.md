# Pet Software Idler - Detailed Technical Backlog

## Overview
This document breaks down the product owner stories into detailed technical implementation tasks suitable for junior developers. Each task includes specific implementation details, file structures, and step-by-step guidance.

## Project Setup Tasks

### TECH-001: Initialize Project Structure
**Parent Story:** Foundation for all stories
**Estimated Time:** 2-4 hours
**Dependencies:** None

**Technical Requirements:**
1. Create a new web project with the following structure:
```
pet-software-idler/
├── index.html
├── css/
│   ├── main.css
│   └── animations.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── ui.js
│   ├── saveSystem.js
│   └── utils.js
├── assets/
│   ├── images/
│   └── sounds/
└── README.md
```

2. Set up index.html with basic structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pet Software Idler</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/animations.css">
</head>
<body>
    <div id="game-container">
        <header id="game-header">
            <h1>Pet Software Company</h1>
        </header>
        <main id="game-main">
            <section id="resources-panel"></section>
            <section id="production-panel"></section>
            <section id="departments-panel"></section>
        </main>
    </div>
    <script src="js/utils.js"></script>
    <script src="js/saveSystem.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/game.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

**Acceptance Criteria:**
- [ ] All files created with proper structure
- [ ] HTML loads without errors
- [ ] Basic CSS reset applied
- [ ] JavaScript files load in correct order
- [ ] Console.log("Game initialized") appears when page loads

---

### TECH-002: Game State Management System
**Parent Story:** Foundation for Stories 1-3
**Estimated Time:** 3-4 hours
**Dependencies:** TECH-001

**Implementation Details:**

1. In `js/game.js`, create the game state object:
```javascript
const GameState = {
    resources: {
        linesOfCode: 0,
        money: 0,
        customerLeads: 0
    },
    units: {
        juniorDevs: 0,
        midDevs: 0,
        seniorDevs: 0,
        salesReps: 0
    },
    production: {
        codePerSecond: 0,
        leadsPerSecond: 0,
        moneyPerSecond: 0
    },
    unlocks: {
        juniorDevUnlocked: false,
        salesDepartmentUnlocked: false,
        featureShippingUnlocked: false
    },
    statistics: {
        totalClicks: 0,
        totalLinesWritten: 0,
        totalMoneyEarned: 0,
        totalFeaturesShipped: 0,
        gameStartTime: Date.now()
    },
    settings: {
        soundEnabled: true,
        autoSaveEnabled: true,
        particlesEnabled: true
    }
};
```

2. Create state update functions:
```javascript
// In game.js
function updateResource(resourceName, amount) {
    if (GameState.resources[resourceName] !== undefined) {
        GameState.resources[resourceName] += amount;
        
        // Update statistics
        if (resourceName === 'linesOfCode') {
            GameState.statistics.totalLinesWritten += amount;
        } else if (resourceName === 'money') {
            GameState.statistics.totalMoneyEarned += amount;
        }
        
        // Notify UI to update
        updateResourceDisplay(resourceName);
        
        // Check for unlocks
        checkUnlocks();
    }
}

function getResource(resourceName) {
    return GameState.resources[resourceName] || 0;
}
```

**Testing Requirements:**
- [ ] Test updateResource() with positive and negative values
- [ ] Verify statistics update correctly
- [ ] Test edge cases (negative resources should be prevented)
- [ ] Verify all resource types can be updated

**Error Handling:**
- Prevent negative resource values
- Log warnings for invalid resource names
- Gracefully handle undefined properties

---

## Core Gameplay Implementation

### TECH-003: Manual Code Writing (Click Mechanic)
**Parent Story:** Story 1 - Basic Code Production
**Estimated Time:** 3-4 hours
**Dependencies:** TECH-002

**Implementation Details:**

1. Create the click button UI in `js/ui.js`:
```javascript
function createCodeButton() {
    const productionPanel = document.getElementById('production-panel');
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.innerHTML = `
        <button id="write-code-btn" class="game-button primary-button">
            <span class="button-text">Write Code</span>
            <span class="button-effect">+1 Line</span>
        </button>
    `;
    
    productionPanel.appendChild(buttonContainer);
    
    // Attach click handler
    document.getElementById('write-code-btn').addEventListener('click', handleCodeClick);
}
```

2. Implement click handler with feedback:
```javascript
// In game.js
function handleCodeClick(event) {
    // Update game state
    updateResource('linesOfCode', 1);
    GameState.statistics.totalClicks++;
    
    // Visual feedback
    createFloatingNumber(event.target, '+1', 'code-popup');
    
    // Animation
    animateButton(event.target);
    
    // Sound effect (if enabled)
    if (GameState.settings.soundEnabled) {
        playSound('click');
    }
    
    // Check for first-time unlocks
    if (GameState.statistics.totalClicks === 5 && !GameState.unlocks.juniorDevUnlocked) {
        unlockJuniorDev();
    }
}

// In ui.js
function animateButton(button) {
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 100);
}

function createFloatingNumber(element, text, className) {
    const popup = document.createElement('div');
    popup.className = `floating-number ${className}`;
    popup.textContent = text;
    
    const rect = element.getBoundingClientRect();
    popup.style.left = rect.left + rect.width / 2 + 'px';
    popup.style.top = rect.top + 'px';
    
    document.body.appendChild(popup);
    
    // Remove after animation
    setTimeout(() => {
        popup.remove();
    }, 1000);
}
```

3. Add CSS animations in `css/animations.css`:
```css
.game-button {
    padding: 15px 30px;
    font-size: 18px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.1s ease;
    position: relative;
}

.game-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.game-button.clicked {
    transform: scale(0.95);
}

.floating-number {
    position: fixed;
    pointer-events: none;
    font-weight: bold;
    font-size: 20px;
    z-index: 1000;
    animation: floatUp 1s ease-out forwards;
}

.code-popup {
    color: #4CAF50;
}

@keyframes floatUp {
    0% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateY(-50px);
    }
}
```

**Acceptance Criteria:**
- [ ] Button produces exactly +1 Line of Code per click
- [ ] Response time < 50ms (measure with performance.now())
- [ ] Visual feedback animation plays smoothly
- [ ] Sound plays if enabled
- [ ] Counter updates immediately
- [ ] No double-clicks register within 100ms

**Performance Considerations:**
- Debounce rapid clicks to prevent performance issues
- Pool floating number elements instead of creating new ones
- Limit simultaneous floating numbers to 10

---

### TECH-004: Resource Display System
**Parent Story:** Stories 1-3 (All need resource display)
**Estimated Time:** 2-3 hours
**Dependencies:** TECH-003

**Implementation Details:**

1. Create resource display UI:
```javascript
// In ui.js
function createResourcePanel() {
    const resourcesPanel = document.getElementById('resources-panel');
    resourcesPanel.innerHTML = `
        <div class="resources-container">
            <div class="resource-item" id="lines-display">
                <span class="resource-icon">💻</span>
                <span class="resource-name">Lines of Code:</span>
                <span class="resource-value" id="lines-value">0</span>
            </div>
            <div class="resource-item" id="money-display" style="display: none;">
                <span class="resource-icon">💰</span>
                <span class="resource-name">Money:</span>
                <span class="resource-value" id="money-value">$0</span>
            </div>
            <div class="resource-item" id="leads-display" style="display: none;">
                <span class="resource-icon">👥</span>
                <span class="resource-name">Customer Leads:</span>
                <span class="resource-value" id="leads-value">0</span>
            </div>
        </div>
    `;
}

function updateResourceDisplay(resourceName) {
    const value = GameState.resources[resourceName];
    let displayElement;
    let formattedValue;
    
    switch(resourceName) {
        case 'linesOfCode':
            displayElement = document.getElementById('lines-value');
            formattedValue = formatNumber(value);
            break;
        case 'money':
            displayElement = document.getElementById('money-value');
            formattedValue = '$' + formatNumber(value);
            // Show money display after first earn
            if (value > 0) {
                document.getElementById('money-display').style.display = 'flex';
            }
            break;
        case 'customerLeads':
            displayElement = document.getElementById('leads-value');
            formattedValue = formatNumber(value);
            if (value > 0) {
                document.getElementById('leads-display').style.display = 'flex';
            }
            break;
    }
    
    if (displayElement) {
        // Animate value change
        animateValueChange(displayElement, formattedValue);
    }
}
```

2. Create number formatting utility:
```javascript
// In utils.js
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
}

function animateValueChange(element, newValue) {
    element.classList.add('value-change');
    element.textContent = newValue;
    setTimeout(() => {
        element.classList.remove('value-change');
    }, 300);
}
```

**Testing Requirements:**
- [ ] Numbers format correctly at all scales
- [ ] Hidden resources appear when first earned
- [ ] Animation plays smoothly
- [ ] Large numbers don't break layout

---

### TECH-005: Junior Developer Automation
**Parent Story:** Story 2 - First Automation
**Estimated Time:** 4-5 hours
**Dependencies:** TECH-003, TECH-004

**Implementation Details:**

1. Create hire button and display:
```javascript
// In ui.js
function unlockJuniorDev() {
    GameState.unlocks.juniorDevUnlocked = true;
    
    const productionPanel = document.getElementById('production-panel');
    const devSection = document.createElement('div');
    devSection.className = 'automation-section';
    devSection.id = 'junior-dev-section';
    devSection.innerHTML = `
        <div class="unit-container">
            <div class="unit-info">
                <h3>Junior Developer</h3>
                <p class="unit-description">Writes 0.1 lines/second automatically</p>
                <p class="unit-owned">Owned: <span id="junior-dev-count">0</span></p>
                <p class="unit-production">Producing: <span id="junior-dev-rate">0</span> lines/sec</p>
            </div>
            <button id="hire-junior-dev" class="game-button hire-button">
                <span class="button-text">Hire Junior Dev</span>
                <span class="button-cost">Cost: <span id="junior-dev-cost">10</span> Lines</span>
            </button>
        </div>
        <div id="junior-dev-visual" class="unit-visual-container"></div>
    `;
    
    productionPanel.appendChild(devSection);
    
    // Attach handler
    document.getElementById('hire-junior-dev').addEventListener('click', () => {
        hireUnit('juniorDevs', 10, 0.1);
    });
    
    // Show unlock animation
    showUnlockAnimation(devSection);
}
```

2. Implement hiring logic:
```javascript
// In game.js
function hireUnit(unitType, baseCost, production) {
    const currentOwned = GameState.units[unitType];
    const cost = calculateUnitCost(baseCost, currentOwned);
    
    if (GameState.resources.linesOfCode >= cost) {
        // Purchase unit
        updateResource('linesOfCode', -cost);
        GameState.units[unitType]++;
        
        // Update production
        GameState.production.codePerSecond += production;
        
        // Update UI
        updateUnitDisplay(unitType);
        updateProductionRates();
        
        // Add visual representation
        addUnitVisual(unitType);
        
        // Sound effect
        if (GameState.settings.soundEnabled) {
            playSound('hire');
        }
        
        // Check for unlocks
        if (GameState.units.juniorDevs === 1 && !GameState.unlocks.featureShippingUnlocked) {
            unlockFeatureShipping();
        }
    } else {
        // Shake button to indicate insufficient funds
        shakeElement(document.getElementById(`hire-${unitType}`));
    }
}

function calculateUnitCost(baseCost, owned) {
    return Math.floor(baseCost * Math.pow(1.15, owned));
}
```

3. Create visual representation:
```javascript
// In ui.js
function addUnitVisual(unitType) {
    const container = document.getElementById(`${unitType}-visual`);
    const sprite = document.createElement('div');
    sprite.className = 'unit-sprite junior-dev-sprite';
    sprite.innerHTML = '👨‍💻';
    
    // Random position within container
    const x = Math.random() * 80 + 10; // 10-90% of container width
    sprite.style.left = x + '%';
    
    // Typing animation
    sprite.classList.add('typing-animation');
    
    container.appendChild(sprite);
}
```

4. Implement production loop:
```javascript
// In game.js
let lastUpdateTime = Date.now();

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    
    // Update production
    if (GameState.production.codePerSecond > 0) {
        updateResource('linesOfCode', GameState.production.codePerSecond * deltaTime);
    }
    
    if (GameState.production.leadsPerSecond > 0) {
        updateResource('customerLeads', GameState.production.leadsPerSecond * deltaTime);
    }
    
    if (GameState.production.moneyPerSecond > 0) {
        updateResource('money', GameState.production.moneyPerSecond * deltaTime);
    }
    
    lastUpdateTime = currentTime;
    requestAnimationFrame(gameLoop);
}

// Start game loop
function startGame() {
    createResourcePanel();
    createCodeButton();
    requestAnimationFrame(gameLoop);
}
```

**CSS for animations:**
```css
.unit-sprite {
    position: absolute;
    bottom: 10px;
    font-size: 32px;
    transition: all 0.3s ease;
}

.typing-animation {
    animation: typing 1s infinite;
}

@keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

.unit-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
    margin: 10px 0;
}
```

**Acceptance Criteria:**
- [ ] Button appears after exactly 5 manual clicks
- [ ] Costs exactly 10 Lines of Code
- [ ] Produces exactly 0.1 lines/second
- [ ] Visual sprite appears and animates
- [ ] Production rate updates in real-time
- [ ] Cost scaling works correctly (10, 11, 12, 14, 16...)

---

### TECH-006: Feature Shipping System
**Parent Story:** Story 3 - Feature Shipping System
**Estimated Time:** 3-4 hours
**Dependencies:** TECH-005

**Implementation Details:**

1. Create ship feature button:
```javascript
// In ui.js
function unlockFeatureShipping() {
    GameState.unlocks.featureShippingUnlocked = true;
    
    const productionPanel = document.getElementById('production-panel');
    const shippingSection = document.createElement('div');
    shippingSection.className = 'shipping-section';
    shippingSection.innerHTML = `
        <div class="feature-shipping-container">
            <h3>Ship Features</h3>
            <p class="shipping-info">Convert 10 Lines → $15</p>
            <button id="ship-feature-btn" class="game-button action-button">
                <span class="button-text">Ship Feature</span>
                <span class="button-requirement">Requires: 10 Lines</span>
            </button>
            <div class="shipping-stats">
                <p>Features Shipped: <span id="features-shipped">0</span></p>
                <p>Conversion Rate: <span id="conversion-rate">10:15</span></p>
            </div>
        </div>
    `;
    
    productionPanel.appendChild(shippingSection);
    
    document.getElementById('ship-feature-btn').addEventListener('click', shipFeature);
    
    // Enable/disable button based on resources
    setInterval(updateShipButtonState, 100);
}

function shipFeature() {
    const requiredLines = 10;
    const moneyEarned = 15;
    
    if (GameState.resources.linesOfCode >= requiredLines) {
        // Consume resources
        updateResource('linesOfCode', -requiredLines);
        
        // Generate money
        updateResource('money', moneyEarned);
        
        // Update statistics
        GameState.statistics.totalFeaturesShipped++;
        document.getElementById('features-shipped').textContent = 
            GameState.statistics.totalFeaturesShipped;
        
        // Visual feedback
        showShippingAnimation();
        
        // Sound effect
        if (GameState.settings.soundEnabled) {
            playSound('ship');
        }
        
        // Check for department unlocks
        checkDepartmentUnlocks();
    }
}

function updateShipButtonState() {
    const button = document.getElementById('ship-feature-btn');
    const hasEnoughLines = GameState.resources.linesOfCode >= 10;
    
    button.disabled = !hasEnoughLines;
    button.classList.toggle('disabled', !hasEnoughLines);
}
```

2. Create shipping animation:
```javascript
// In ui.js
function showShippingAnimation() {
    const container = document.querySelector('.feature-shipping-container');
    const animation = document.createElement('div');
    animation.className = 'shipping-animation';
    animation.innerHTML = '📦➡️💰';
    
    container.appendChild(animation);
    
    // Animate across screen
    setTimeout(() => {
        animation.classList.add('ship-move');
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
        animation.remove();
    }, 2000);
}
```

**CSS:**
```css
.shipping-animation {
    position: absolute;
    font-size: 24px;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    transition: all 1.5s ease-out;
}

.shipping-animation.ship-move {
    left: 100%;
    opacity: 0;
}

.game-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

**Testing Requirements:**
- [ ] Button only enabled when player has 10+ lines
- [ ] Exactly 10 lines consumed per ship
- [ ] Exactly $15 earned per ship
- [ ] Animation plays smoothly
- [ ] Statistics update correctly
- [ ] Money display appears on first earn

---

### TECH-007: Save System Implementation
**Parent Story:** Story 8 - Save System
**Estimated Time:** 4-5 hours
**Dependencies:** TECH-002

**Implementation Details:**

1. Implement save functionality:
```javascript
// In saveSystem.js
const SaveSystem = {
    SAVE_KEY: 'petSoftwareIdler_saveData',
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    
    saveGame: function() {
        try {
            const saveData = {
                version: "1.0.0",
                timestamp: Date.now(),
                gameState: GameState,
                // Calculate total play time
                totalPlayTime: Date.now() - GameState.statistics.gameStartTime
            };
            
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            
            // Show save notification
            this.showSaveNotification();
            
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            this.showSaveError();
            return false;
        }
    },
    
    loadGame: function() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) return false;
            
            const parsedData = JSON.parse(savedData);
            
            // Version check
            if (parsedData.version !== "1.0.0") {
                console.warn('Save version mismatch');
                // Handle migration if needed
            }
            
            // Restore game state
            Object.assign(GameState, parsedData.gameState);
            
            // Calculate offline progress
            const offlineTime = Date.now() - parsedData.timestamp;
            this.calculateOfflineProgress(offlineTime);
            
            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    },
    
    calculateOfflineProgress: function(offlineMs) {
        const offlineSeconds = Math.min(offlineMs / 1000, 43200); // Cap at 12 hours
        
        if (offlineSeconds > 60) { // Only show if offline for more than 1 minute
            const offlineProduction = {
                linesOfCode: GameState.production.codePerSecond * offlineSeconds,
                money: GameState.production.moneyPerSecond * offlineSeconds,
                customerLeads: GameState.production.leadsPerSecond * offlineSeconds
            };
            
            // Apply offline earnings
            if (offlineProduction.linesOfCode > 0) {
                updateResource('linesOfCode', offlineProduction.linesOfCode);
            }
            if (offlineProduction.money > 0) {
                updateResource('money', offlineProduction.money);
            }
            if (offlineProduction.customerLeads > 0) {
                updateResource('customerLeads', offlineProduction.customerLeads);
            }
            
            // Show offline progress popup
            this.showOfflineProgress(offlineSeconds, offlineProduction);
        }
    },
    
    showSaveNotification: function() {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = 'Game Saved!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    },
    
    showOfflineProgress: function(seconds, production) {
        const modal = document.createElement('div');
        modal.className = 'offline-modal';
        modal.innerHTML = `
            <div class="offline-content">
                <h2>Welcome Back!</h2>
                <p>You were away for ${formatTime(seconds)}</p>
                <h3>Offline Earnings:</h3>
                <ul>
                    ${production.linesOfCode > 0 ? `<li>+${formatNumber(production.linesOfCode)} Lines of Code</li>` : ''}
                    ${production.money > 0 ? `<li>+$${formatNumber(production.money)}</li>` : ''}
                    ${production.customerLeads > 0 ? `<li>+${formatNumber(production.customerLeads)} Customer Leads</li>` : ''}
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Continue</button>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    deleteSave: function() {
        if (confirm('Are you sure you want to delete your save? This cannot be undone!')) {
            localStorage.removeItem(this.SAVE_KEY);
            location.reload();
        }
    },
    
    exportSave: function() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        if (saveData) {
            const blob = new Blob([saveData], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'PetSoftwareIdler_save_' + Date.now() + '.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    },
    
    importSave: function(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saveData = e.target.result;
                localStorage.setItem(this.SAVE_KEY, saveData);
                location.reload();
            } catch (error) {
                alert('Failed to import save file');
            }
        };
        reader.readAsText(file);
    }
};

// Auto-save setup
function initializeAutoSave() {
    // Manual save button
    const saveButton = document.createElement('button');
    saveButton.id = 'manual-save-btn';
    saveButton.className = 'game-button';
    saveButton.textContent = 'Save Game';
    saveButton.onclick = () => SaveSystem.saveGame();
    
    document.getElementById('game-header').appendChild(saveButton);
    
    // Auto-save interval
    if (GameState.settings.autoSaveEnabled) {
        setInterval(() => {
            SaveSystem.saveGame();
        }, SaveSystem.AUTO_SAVE_INTERVAL);
    }
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        SaveSystem.saveGame();
    });
}
```

**CSS for save notifications:**
```css
.save-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
}

.save-notification.fade-out {
    animation: fadeOut 0.5s ease-out forwards;
}

.offline-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.offline-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 400px;
    text-align: center;
}
```

**Testing Requirements:**
- [ ] Auto-save triggers every 30 seconds
- [ ] Manual save works instantly
- [ ] Save persists after page reload
- [ ] Offline progress calculates correctly
- [ ] 12-hour cap enforced
- [ ] Save notification appears and disappears
- [ ] Can export and import saves

---

### TECH-008: Department System - Sales
**Parent Story:** Story 4 - Sales Department Unlock
**Estimated Time:** 5-6 hours
**Dependencies:** TECH-006

**Implementation Details:**

1. Create department unlock system:
```javascript
// In game.js
function checkDepartmentUnlocks() {
    // Sales department unlocks at $500 total earned
    if (GameState.statistics.totalMoneyEarned >= 500 && !GameState.unlocks.salesDepartmentUnlocked) {
        unlockSalesDepartment();
    }
}

// In ui.js
function unlockSalesDepartment() {
    GameState.unlocks.salesDepartmentUnlocked = true;
    
    // Create departments panel if it doesn't exist
    let departmentsPanel = document.getElementById('departments-panel');
    if (!departmentsPanel.querySelector('.departments-container')) {
        departmentsPanel.innerHTML = `
            <h2>Departments</h2>
            <div class="departments-container"></div>
        `;
    }
    
    const container = departmentsPanel.querySelector('.departments-container');
    const salesDept = document.createElement('div');
    salesDept.className = 'department sales-department';
    salesDept.innerHTML = `
        <div class="department-header">
            <h3>Sales Department</h3>
            <span class="department-status">NEW!</span>
        </div>
        <div class="department-content">
            <p class="department-description">Sales reps generate customer leads for enhanced revenue</p>
            <div class="unit-hiring">
                <div class="unit-info">
                    <h4>Sales Representative</h4>
                    <p>Generates 0.2 leads/second</p>
                    <p>Owned: <span id="sales-rep-count">0</span></p>
                    <p>Total production: <span id="sales-production">0</span> leads/sec</p>
                </div>
                <button id="hire-sales-rep" class="game-button hire-button">
                    <span>Hire Sales Rep</span>
                    <span>Cost: $<span id="sales-rep-cost">100</span></span>
                </button>
            </div>
            <div id="sales-visual" class="department-visual"></div>
        </div>
    `;
    
    container.appendChild(salesDept);
    
    // Animate department expansion
    showDepartmentExpansion(salesDept);
    
    // Attach hire handler
    document.getElementById('hire-sales-rep').addEventListener('click', () => {
        hireSalesRep();
    });
}

function showDepartmentExpansion(element) {
    element.style.maxHeight = '0';
    element.style.overflow = 'hidden';
    element.style.transition = 'max-height 1s ease-out';
    
    setTimeout(() => {
        element.style.maxHeight = '500px';
    }, 10);
    
    // Particle effect
    createDepartmentParticles(element);
}

function hireSalesRep() {
    const baseCost = 100;
    const currentOwned = GameState.units.salesReps;
    const cost = calculateUnitCost(baseCost, currentOwned);
    
    if (GameState.resources.money >= cost) {
        updateResource('money', -cost);
        GameState.units.salesReps++;
        GameState.production.leadsPerSecond += 0.2;
        
        // Update UI
        document.getElementById('sales-rep-count').textContent = GameState.units.salesReps;
        document.getElementById('sales-production').textContent = 
            (GameState.units.salesReps * 0.2).toFixed(1);
        document.getElementById('sales-rep-cost').textContent = 
            calculateUnitCost(baseCost, GameState.units.salesReps);
        
        // Add visual
        addSalesRepVisual();
        
        // Enable lead conversion if first rep
        if (GameState.units.salesReps === 1) {
            enableLeadConversion();
        }
    }
}
```

2. Implement lead-to-revenue conversion:
```javascript
// In game.js
let conversionCheckInterval;

function enableLeadConversion() {
    // Check for conversions every 100ms
    conversionCheckInterval = setInterval(checkLeadConversions, 100);
    
    // Show conversion UI
    showConversionUI();
}

function checkLeadConversions() {
    const leadsAvailable = Math.floor(GameState.resources.customerLeads);
    const featuresAvailable = Math.floor(GameState.resources.linesOfCode / 10);
    
    if (leadsAvailable > 0 && featuresAvailable > 0) {
        // Convert 1 lead + 1 feature (10 lines) = $50
        const conversions = Math.min(leadsAvailable, featuresAvailable);
        
        // Batch conversions for performance
        if (conversions > 0) {
            updateResource('customerLeads', -conversions);
            updateResource('linesOfCode', -conversions * 10);
            updateResource('money', conversions * 50);
            
            // Show conversion animation
            showConversionAnimation(conversions);
        }
    }
}

function showConversionUI() {
    const conversionInfo = document.createElement('div');
    conversionInfo.className = 'conversion-info';
    conversionInfo.innerHTML = `
        <h3>Lead Conversion Active!</h3>
        <p>1 Lead + 1 Feature (10 lines) = $50</p>
        <div class="conversion-rate">
            <span>Conversion Rate: </span>
            <span id="conversion-rate-display">Automatic</span>
        </div>
    `;
    
    document.getElementById('departments-panel').appendChild(conversionInfo);
}
```

**Testing Requirements:**
- [ ] Sales department unlocks exactly at $500 total earned
- [ ] Visual expansion animation plays smoothly
- [ ] First Sales Rep costs exactly $100
- [ ] Generates exactly 0.2 leads/second
- [ ] Lead counter appears when first lead generated
- [ ] Automatic conversion works correctly
- [ ] Conversion rate: 1 lead + 10 lines = $50

---

### TECH-009: Developer Tier System
**Parent Story:** Story 6 - Development Team Scaling
**Estimated Time:** 4-5 hours
**Dependencies:** TECH-005

**Implementation Details:**

1. Extend developer system with tiers:
```javascript
// In game.js
const DeveloperTiers = {
    junior: {
        name: "Junior Developer",
        baseCost: 10,
        production: 0.1,
        icon: "👨‍💻",
        unlockRequirement: () => true
    },
    mid: {
        name: "Mid Developer", 
        baseCost: 100,
        production: 0.5,
        icon: "👨‍💼",
        unlockRequirement: () => GameState.units.juniorDevs >= 5
    },
    senior: {
        name: "Senior Developer",
        baseCost: 1000,
        production: 2.5,
        icon: "🧙‍♂️",
        unlockRequirement: () => GameState.units.midDevs >= 3
    }
};

function checkDeveloperUnlocks() {
    Object.entries(DeveloperTiers).forEach(([tier, config]) => {
        const unlockKey = `${tier}DevUnlocked`;
        if (!GameState.unlocks[unlockKey] && config.unlockRequirement()) {
            unlockDeveloperTier(tier, config);
        }
    });
}

function unlockDeveloperTier(tier, config) {
    GameState.unlocks[`${tier}DevUnlocked`] = true;
    
    const devSection = document.createElement('div');
    devSection.className = `automation-section ${tier}-dev-section`;
    devSection.innerHTML = `
        <div class="unit-container tier-${tier}">
            <div class="unit-info">
                <h3>${config.name}</h3>
                <p class="unit-description">Writes ${config.production} lines/second</p>
                <p class="unit-owned">Owned: <span id="${tier}-dev-count">0</span></p>
                <p class="unit-production">Total: <span id="${tier}-dev-rate">0</span> lines/sec</p>
            </div>
            <button id="hire-${tier}-dev" class="game-button hire-button">
                <span class="button-text">Hire ${config.name}</span>
                <span class="button-cost">Cost: <span id="${tier}-dev-cost">${config.baseCost}</span> Lines</span>
            </button>
        </div>
        <div id="${tier}-dev-visual" class="unit-visual-container"></div>
    `;
    
    document.getElementById('production-panel').appendChild(devSection);
    
    // Attach handler
    document.getElementById(`hire-${tier}-dev`).addEventListener('click', () => {
        hireDeveloper(tier, config);
    });
}

function hireDeveloper(tier, config) {
    const unitKey = `${tier}Devs`;
    const currentOwned = GameState.units[unitKey];
    const cost = calculateUnitCost(config.baseCost, currentOwned);
    
    if (GameState.resources.linesOfCode >= cost) {
        updateResource('linesOfCode', -cost);
        GameState.units[unitKey]++;
        GameState.production.codePerSecond += config.production;
        
        // Update displays
        updateDeveloperDisplay(tier, config);
        
        // Add visual
        addDeveloperVisual(tier, config);
        
        // Check for new unlocks
        checkDeveloperUnlocks();
    }
}

function updateDeveloperDisplay(tier, config) {
    const unitKey = `${tier}Devs`;
    const owned = GameState.units[unitKey];
    
    document.getElementById(`${tier}-dev-count`).textContent = owned;
    document.getElementById(`${tier}-dev-rate`).textContent = 
        (owned * config.production).toFixed(1);
    document.getElementById(`${tier}-dev-cost`).textContent = 
        formatNumber(calculateUnitCost(config.baseCost, owned));
}
```

2. Create visual distinction between tiers:
```css
.tier-junior {
    background: #e8f5e9;
    border-left: 4px solid #4CAF50;
}

.tier-mid {
    background: #e3f2fd;
    border-left: 4px solid #2196F3;
}

.tier-senior {
    background: #f3e5f5;
    border-left: 4px solid #9C27B0;
}

.unit-visual-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 50px;
    position: relative;
}

.dev-sprite-junior {
    color: #4CAF50;
}

.dev-sprite-mid {
    color: #2196F3;
    font-size: 36px;
}

.dev-sprite-senior {
    color: #9C27B0;
    font-size: 40px;
    animation: senior-glow 2s infinite;
}

@keyframes senior-glow {
    0%, 100% { filter: drop-shadow(0 0 2px #9C27B0); }
    50% { filter: drop-shadow(0 0 8px #9C27B0); }
}
```

**Testing Requirements:**
- [ ] Mid Dev unlocks after 5 Junior Devs
- [ ] Senior Dev unlocks after 3 Mid Devs
- [ ] Production rates: 0.1, 0.5, 2.5 lines/sec
- [ ] Base costs: 10, 100, 1000 lines
- [ ] Cost scaling: Base * 1.15^owned
- [ ] Visual distinction clear between tiers

---

### TECH-010: Visual Polish and Feedback
**Parent Story:** Story 11 - Visual Feedback System
**Estimated Time:** 4-5 hours
**Dependencies:** All core features

**Implementation Details:**

1. Implement comprehensive floating number system:
```javascript
// In ui.js
class FloatingNumberPool {
    constructor(poolSize = 50) {
        this.pool = [];
        this.active = [];
        
        // Pre-create pool elements
        for (let i = 0; i < poolSize; i++) {
            const element = document.createElement('div');
            element.className = 'floating-number pooled';
            element.style.display = 'none';
            document.body.appendChild(element);
            this.pool.push(element);
        }
    }
    
    spawn(x, y, text, type = 'default') {
        let element = this.pool.pop();
        if (!element) {
            // Pool exhausted, recycle oldest active
            element = this.active.shift();
            this.reset(element);
        }
        
        element.textContent = text;
        element.className = `floating-number floating-${type}`;
        element.style.display = 'block';
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        
        this.active.push(element);
        
        // Start animation
        requestAnimationFrame(() => {
            element.classList.add('floating-active');
        });
        
        // Return to pool after animation
        setTimeout(() => {
            this.release(element);
        }, 1000);
    }
    
    release(element) {
        const index = this.active.indexOf(element);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        this.reset(element);
        this.pool.push(element);
    }
    
    reset(element) {
        element.style.display = 'none';
        element.className = 'floating-number pooled';
        element.textContent = '';
    }
}

const floatingNumbers = new FloatingNumberPool();

// Enhanced floating number creation
function createFloatingNumber(element, value, type) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 20;
    const y = rect.top;
    
    // Format based on type
    let text = value;
    if (type === 'money') {
        text = `+$${formatNumber(value)}`;
    } else if (type === 'code') {
        text = `+${formatNumber(value)}`;
    }
    
    floatingNumbers.spawn(x, y, text, type);
}
```

2. Implement milestone effects:
```javascript
// In ui.js
const MilestoneEffects = {
    checkMilestones: function(resourceType, oldValue, newValue) {
        const milestones = [10, 100, 1000, 10000, 100000, 1000000];
        
        milestones.forEach(milestone => {
            if (oldValue < milestone && newValue >= milestone) {
                this.triggerMilestone(resourceType, milestone);
            }
        });
    },
    
    triggerMilestone: function(resourceType, value) {
        // Screen shake for big numbers
        if (value >= 1000) {
            this.screenShake(Math.min(value / 10000, 1));
        }
        
        // Particle burst
        this.particleBurst(resourceType, value);
        
        // Sound effect
        if (GameState.settings.soundEnabled) {
            playSound('milestone', Math.min(value / 100000, 1));
        }
        
        // Achievement check
        checkAchievement(`${resourceType}_${value}`);
    },
    
    screenShake: function(intensity) {
        const gameContainer = document.getElementById('game-container');
        gameContainer.style.animation = `shake ${0.5 * intensity}s`;
        
        setTimeout(() => {
            gameContainer.style.animation = '';
        }, 500 * intensity);
    },
    
    particleBurst: function(type, value) {
        const particles = Math.min(Math.log10(value) * 10, 50);
        const container = document.getElementById('game-main');
        
        for (let i = 0; i < particles; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = `particle particle-${type}`;
                particle.style.left = '50%';
                particle.style.top = '50%';
                
                const angle = (Math.PI * 2 * i) / particles;
                const velocity = 200 + Math.random() * 200;
                
                particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
                particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');
                
                container.appendChild(particle);
                
                setTimeout(() => particle.remove(), 1000);
            }, i * 10);
        }
    }
};
```

3. Progress bar animations:
```javascript
// In ui.js
function createProgressBar(container, label, current, max, color) {
    const progressElement = document.createElement('div');
    progressElement.className = 'progress-container';
    progressElement.innerHTML = `
        <div class="progress-label">${label}</div>
        <div class="progress-bar">
            <div class="progress-fill" style="background: ${color}">
                <span class="progress-text">${Math.floor(current/max * 100)}%</span>
            </div>
        </div>
    `;
    
    container.appendChild(progressElement);
    
    // Animate fill
    const fill = progressElement.querySelector('.progress-fill');
    const targetWidth = (current / max * 100) + '%';
    
    requestAnimationFrame(() => {
        fill.style.width = targetWidth;
        fill.style.transition = 'width 0.5s ease-out';
    });
    
    return progressElement;
}
```

**CSS for effects:**
```css
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    pointer-events: none;
    animation: particle-fly 1s ease-out forwards;
}

.particle-money {
    background: #FFD700;
    box-shadow: 0 0 6px #FFD700;
}

.particle-code {
    background: #4CAF50;
    box-shadow: 0 0 6px #4CAF50;
}

@keyframes particle-fly {
    0% {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(var(--dx), var(--dy)) scale(0.5);
    }
}

.progress-container {
    margin: 10px 0;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
}
```

**Testing Requirements:**
- [ ] Floating numbers don't overlap excessively
- [ ] Pool system prevents memory leaks
- [ ] Milestone effects trigger at correct values
- [ ] Screen shake intensity scales appropriately
- [ ] Particles render smoothly
- [ ] All animations complete within 1 second

---

### TECH-011: Achievement System
**Parent Story:** Story 10 - Achievement System
**Estimated Time:** 3-4 hours
**Dependencies:** TECH-007 (for save integration)

**Implementation Details:**

1. Define achievement structure:
```javascript
// In game.js
const Achievements = {
    firstClick: {
        id: 'first_click',
        name: 'Hello World',
        description: 'Write your first line of code',
        icon: '🎯',
        check: () => GameState.statistics.totalClicks >= 1
    },
    firstHire: {
        id: 'first_hire',
        name: 'Growing Team',
        description: 'Hire your first developer',
        icon: '👥',
        check: () => GameState.units.juniorDevs >= 1
    },
    firstFeature: {
        id: 'first_feature',
        name: 'Shipped It!',
        description: 'Ship your first feature',
        icon: '📦',
        check: () => GameState.statistics.totalFeaturesShipped >= 1
    },
    firstThousand: {
        id: 'first_thousand',
        name: 'Venture Funded',
        description: 'Earn your first $1,000',
        icon: '💰',
        check: () => GameState.statistics.totalMoneyEarned >= 1000
    },
    codeMonkey: {
        id: 'code_monkey',
        name: 'Code Monkey',
        description: 'Write 10,000 lines of code',
        icon: '🐒',
        check: () => GameState.statistics.totalLinesWritten >= 10000
    },
    salesForce: {
        id: 'sales_force',
        name: 'Sales Force',
        description: 'Have 10 sales representatives',
        icon: '📈',
        check: () => GameState.units.salesReps >= 10
    },
    diverseTeam: {
        id: 'diverse_team',
        name: 'Diverse Team',
        description: 'Have all three developer tiers',
        icon: '🌟',
        check: () => GameState.units.juniorDevs >= 1 && 
                     GameState.units.midDevs >= 1 && 
                     GameState.units.seniorDevs >= 1
    },
    automation: {
        id: 'automation',
        name: 'Full Automation',
        description: 'Produce 100 lines/second',
        icon: '🤖',
        check: () => GameState.production.codePerSecond >= 100
    },
    bigSpender: {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spend $10,000 on a single purchase',
        icon: '💸',
        check: () => false, // Special check in purchase logic
        special: true
    },
    speedRunner: {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Reach $10,000 in under 10 minutes',
        icon: '⚡',
        check: () => GameState.resources.money >= 10000 && 
                     (Date.now() - GameState.statistics.gameStartTime) < 600000
    }
};

// Achievement tracking
let unlockedAchievements = new Set();

function checkAchievements() {
    Object.values(Achievements).forEach(achievement => {
        if (!unlockedAchievements.has(achievement.id) && 
            !achievement.special && 
            achievement.check()) {
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    unlockedAchievements.add(achievement.id);
    
    // Save to game state
    if (!GameState.achievements) {
        GameState.achievements = [];
    }
    GameState.achievements.push({
        id: achievement.id,
        unlockedAt: Date.now()
    });
    
    // Show notification
    showAchievementNotification(achievement);
    
    // Update UI
    updateAchievementDisplay();
}
```

2. Create achievement UI:
```javascript
// In ui.js
function createAchievementPanel() {
    const achievementButton = document.createElement('button');
    achievementButton.id = 'achievement-button';
    achievementButton.className = 'game-button';
    achievementButton.innerHTML = `🏆 Achievements (${unlockedAchievements.size}/${Object.keys(Achievements).length})`;
    achievementButton.onclick = toggleAchievementModal;
    
    document.getElementById('game-header').appendChild(achievementButton);
}

function toggleAchievementModal() {
    let modal = document.getElementById('achievement-modal');
    
    if (modal) {
        modal.remove();
        return;
    }
    
    modal = document.createElement('div');
    modal.id = 'achievement-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Achievements</h2>
            <div class="achievement-grid">
                ${Object.values(Achievements).map(ach => `
                    <div class="achievement-item ${unlockedAchievements.has(ach.id) ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${ach.icon}</div>
                        <div class="achievement-info">
                            <h3>${ach.name}</h3>
                            <p>${ach.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-popup">
            <div class="achievement-icon-large">${achievement.icon}</div>
            <div>
                <h3>Achievement Unlocked!</h3>
                <p>${achievement.name}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
```

**CSS for achievements:**
```css
.achievement-notification {
    position: fixed;
    top: 100px;
    right: -400px;
    z-index: 2000;
    transition: right 0.5s ease-out;
}

.achievement-notification.show {
    right: 20px;
}

.achievement-notification.hide {
    right: -400px;
}

.achievement-popup {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}

.achievement-icon-large {
    font-size: 48px;
}

.achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    max-height: 400px;
    overflow-y: auto;
}

.achievement-item {
    padding: 15px;
    border-radius: 8px;
    background: #f5f5f5;
    transition: all 0.3s ease;
}

.achievement-item.unlocked {
    background: #e8f5e9;
    border: 2px solid #4CAF50;
}

.achievement-item.locked {
    opacity: 0.6;
    filter: grayscale(1);
}
```

**Testing Requirements:**
- [ ] All 10 achievements can be unlocked
- [ ] Achievement state persists in saves
- [ ] Notifications appear and disappear correctly
- [ ] Achievement count updates in button
- [ ] Modal displays correctly
- [ ] Special achievements trigger properly

---

### TECH-012: Audio System
**Parent Story:** Story 12 - Audio Feedback
**Estimated Time:** 3-4 hours
**Dependencies:** TECH-001

**Implementation Details:**

1. Create audio manager:
```javascript
// In game.js
const AudioManager = {
    sounds: {},
    lastPlayTime: {},
    audioContext: null,
    masterVolume: 0.5,
    
    init: function() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.loadSounds();
            }
        }, { once: true });
    },
    
    loadSounds: function() {
        // Define sound configurations
        const soundConfigs = {
            click: { frequency: 440, duration: 0.05, type: 'square', volume: 0.1 },
            hire: { frequency: 523, duration: 0.1, type: 'sine', volume: 0.2 },
            ship: { frequency: 659, duration: 0.15, type: 'triangle', volume: 0.15 },
            milestone: { frequency: 880, duration: 0.3, type: 'sine', volume: 0.3 },
            error: { frequency: 220, duration: 0.1, type: 'sawtooth', volume: 0.2 }
        };
        
        // Generate sounds programmatically
        Object.entries(soundConfigs).forEach(([name, config]) => {
            this.sounds[name] = config;
        });
    },
    
    playSound: function(soundName, volumeMultiplier = 1) {
        if (!GameState.settings.soundEnabled || !this.audioContext) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        // Prevent sound spam
        const now = Date.now();
        const lastPlay = this.lastPlayTime[soundName] || 0;
        if (now - lastPlay < 50) return; // 50ms cooldown
        
        this.lastPlayTime[soundName] = now;
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
        
        // Volume scaling
        const volume = sound.volume * this.masterVolume * volumeMultiplier;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    },
    
    playSequence: function(notes, tempo = 120) {
        if (!GameState.settings.soundEnabled || !this.audioContext) return;
        
        const beatDuration = 60 / tempo;
        
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playNote(note.frequency, note.duration, note.volume);
            }, index * beatDuration * 1000);
        });
    },
    
    playNote: function(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
};

// Initialize audio
AudioManager.init();

// Global helper
function playSound(soundName, volumeMultiplier) {
    AudioManager.playSound(soundName, volumeMultiplier);
}
```

2. Create sound settings UI:
```javascript
// In ui.js
function createSoundSettings() {
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'sound-settings';
    settingsContainer.innerHTML = `
        <button id="sound-toggle" class="game-button icon-button">
            <span id="sound-icon">${GameState.settings.soundEnabled ? '🔊' : '🔇'}</span>
        </button>
        <input type="range" id="volume-slider" min="0" max="100" value="50" 
               style="${GameState.settings.soundEnabled ? '' : 'display:none'}">
    `;
    
    document.getElementById('game-header').appendChild(settingsContainer);
    
    // Event handlers
    document.getElementById('sound-toggle').onclick = toggleSound;
    document.getElementById('volume-slider').oninput = updateVolume;
}

function toggleSound() {
    GameState.settings.soundEnabled = !GameState.settings.soundEnabled;
    document.getElementById('sound-icon').textContent = 
        GameState.settings.soundEnabled ? '🔊' : '🔇';
    document.getElementById('volume-slider').style.display = 
        GameState.settings.soundEnabled ? 'inline' : 'none';
    
    // Play test sound if enabled
    if (GameState.settings.soundEnabled) {
        playSound('click');
    }
}

function updateVolume(event) {
    AudioManager.masterVolume = event.target.value / 100;
    playSound('click');
}
```

3. Integrate sounds with game actions:
```javascript
// Add to existing functions:

// In handleCodeClick
if (GameState.settings.soundEnabled) {
    playSound('click');
}

// In hireUnit
if (GameState.settings.soundEnabled) {
    playSound('hire');
}

// In shipFeature
if (GameState.settings.soundEnabled) {
    playSound('ship');
}

// In milestone triggers
if (GameState.settings.soundEnabled) {
    const intensity = Math.min(value / 100000, 1);
    playSound('milestone', 1 + intensity);
}

// Achievement unlock fanfare
function playAchievementFanfare() {
    const notes = [
        { frequency: 523, duration: 0.1, volume: 0.2 },
        { frequency: 659, duration: 0.1, volume: 0.2 },
        { frequency: 784, duration: 0.2, volume: 0.3 }
    ];
    AudioManager.playSequence(notes, 240);
}
```

**Testing Requirements:**
- [ ] Sounds play on appropriate actions
- [ ] No sound repetition within 50ms
- [ ] Volume slider works correctly
- [ ] Mute button toggles all sounds
- [ ] Different sounds are distinguishable
- [ ] No audio errors in console

---

### TECH-013: Performance Optimization
**Parent Story:** Story 15 - Performance Optimization
**Estimated Time:** 4-5 hours
**Dependencies:** All features implemented

**Implementation Details:**

1. Implement efficient number handling:
```javascript
// In utils.js
class BigNumber {
    constructor(mantissa = 0, exponent = 0) {
        this.mantissa = mantissa;
        this.exponent = exponent;
        this.normalize();
    }
    
    normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            return;
        }
        
        while (Math.abs(this.mantissa) >= 10) {
            this.mantissa /= 10;
            this.exponent++;
        }
        
        while (Math.abs(this.mantissa) < 1 && this.exponent > 0) {
            this.mantissa *= 10;
            this.exponent--;
        }
    }
    
    add(other) {
        if (other.exponent > this.exponent) {
            const diff = other.exponent - this.exponent;
            this.mantissa = this.mantissa / Math.pow(10, diff) + other.mantissa;
            this.exponent = other.exponent;
        } else {
            const diff = this.exponent - other.exponent;
            this.mantissa = this.mantissa + other.mantissa / Math.pow(10, diff);
        }
        this.normalize();
        return this;
    }
    
    multiply(scalar) {
        this.mantissa *= scalar;
        this.normalize();
        return this;
    }
    
    toNumber() {
        return this.mantissa * Math.pow(10, this.exponent);
    }
    
    toString() {
        if (this.exponent < 6) {
            return this.toNumber().toFixed(0);
        }
        return `${this.mantissa.toFixed(2)}e${this.exponent}`;
    }
}

// Update resource handling for large numbers
function updateResourceOptimized(resourceName, amount) {
    // Use regular numbers up to 1e15, then switch to BigNumber
    const current = GameState.resources[resourceName];
    
    if (current + amount > 1e15 || current instanceof BigNumber) {
        if (!(current instanceof BigNumber)) {
            GameState.resources[resourceName] = new BigNumber(current, 0);
        }
        GameState.resources[resourceName].add(new BigNumber(amount, 0));
    } else {
        GameState.resources[resourceName] += amount;
    }
    
    // Batch UI updates
    scheduleUIUpdate(resourceName);
}
```

2. Implement UI update batching:
```javascript
// In ui.js
const UIUpdateQueue = {
    pending: new Set(),
    frameRequested: false,
    
    schedule(updateType, data) {
        this.pending.add({ type: updateType, data: data });
        
        if (!this.frameRequested) {
            this.frameRequested = true;
            requestAnimationFrame(() => this.flush());
        }
    },
    
    flush() {
        const updates = Array.from(this.pending);
        this.pending.clear();
        this.frameRequested = false;
        
        // Group updates by type
        const grouped = updates.reduce((acc, update) => {
            if (!acc[update.type]) {
                acc[update.type] = [];
            }
            acc[update.type].push(update.data);
            return acc;
        }, {});
        
        // Process updates
        Object.entries(grouped).forEach(([type, dataArray]) => {
            switch(type) {
                case 'resource':
                    this.updateResources(dataArray);
                    break;
                case 'unit':
                    this.updateUnits(dataArray);
                    break;
                case 'production':
                    this.updateProduction(dataArray);
                    break;
            }
        });
    },
    
    updateResources(resources) {
        resources.forEach(resourceName => {
            const element = document.getElementById(`${resourceName}-value`);
            if (element) {
                const value = GameState.resources[resourceName];
                element.textContent = formatNumberOptimized(value);
            }
        });
    }
};

function scheduleUIUpdate(resourceName) {
    UIUpdateQueue.schedule('resource', resourceName);
}
```

3. Optimize render loop:
```javascript
// In game.js
const GameLoop = {
    lastUpdate: Date.now(),
    lastRender: Date.now(),
    updateInterval: 50, // 20 updates per second
    renderInterval: 100, // 10 renders per second
    
    start() {
        this.update();
        this.render();
    },
    
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;
        
        // Update game logic
        if (deltaTime >= this.updateInterval / 1000) {
            this.updateProduction(deltaTime);
            this.lastUpdate = now;
        }
        
        // Schedule next update
        setTimeout(() => this.update(), this.updateInterval);
    },
    
    render() {
        const now = Date.now();
        
        if (now - this.lastRender >= this.renderInterval) {
            UIUpdateQueue.flush();
            this.lastRender = now;
        }
        
        requestAnimationFrame(() => this.render());
    },
    
    updateProduction(deltaTime) {
        // Batch production updates
        const updates = {};
        
        if (GameState.production.codePerSecond > 0) {
            updates.linesOfCode = GameState.production.codePerSecond * deltaTime;
        }
        
        if (GameState.production.leadsPerSecond > 0) {
            updates.customerLeads = GameState.production.leadsPerSecond * deltaTime;
        }
        
        if (GameState.production.moneyPerSecond > 0) {
            updates.money = GameState.production.moneyPerSecond * deltaTime;
        }
        
        // Apply all updates at once
        Object.entries(updates).forEach(([resource, amount]) => {
            updateResourceOptimized(resource, amount);
        });
    }
};
```

4. Memory management:
```javascript
// In utils.js
const MemoryManager = {
    pools: {
        particles: [],
        floatingNumbers: [],
        animations: []
    },
    
    cleanupInterval: 10000, // 10 seconds
    
    init() {
        setInterval(() => this.cleanup(), this.cleanupInterval);
    },
    
    cleanup() {
        // Remove completed animations
        document.querySelectorAll('.animation-complete').forEach(el => el.remove());
        
        // Clean up detached nodes
        this.pools.particles = this.pools.particles.filter(p => p.isConnected);
        this.pools.floatingNumbers = this.pools.floatingNumbers.filter(n => n.isConnected);
        
        // Log memory usage in development
        if (performance.memory) {
            console.log('Memory usage:', {
                used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
            });
        }
    }
};
```

**Testing Requirements:**
- [ ] Maintain 60 FPS with 100+ units
- [ ] No memory leaks over 1-hour session
- [ ] Large numbers display correctly
- [ ] UI updates batch efficiently
- [ ] Smooth animations under load
- [ ] Performance on 5-year-old devices

---

### TECH-014: Core Loop Validation
**Parent Story:** Story 16 - Core Loop Validation
**Estimated Time:** 2-3 hours
**Dependencies:** All core features

**Implementation Details:**

1. Implement onboarding flow:
```javascript
// In game.js
const OnboardingFlow = {
    steps: [
        {
            trigger: () => GameState.statistics.totalClicks === 0,
            highlight: '#write-code-btn',
            message: 'Click here to write your first line of code!'
        },
        {
            trigger: () => GameState.statistics.totalClicks === 5,
            highlight: '#hire-junior-dev',
            message: 'Great! Now hire your first developer to automate production.'
        },
        {
            trigger: () => GameState.units.juniorDevs === 1,
            highlight: '#ship-feature-btn',
            message: 'Your developer is writing code! Ship features to earn money.'
        },
        {
            trigger: () => GameState.statistics.totalMoneyEarned >= 100,
            highlight: '.departments-container',
            message: 'Keep growing! New departments will unlock as you earn more.'
        }
    ],
    
    currentStep: 0,
    
    init() {
        this.checkStep();
    },
    
    checkStep() {
        if (this.currentStep >= this.steps.length) return;
        
        const step = this.steps[this.currentStep];
        if (!step.trigger()) {
            setTimeout(() => this.checkStep(), 100);
            return;
        }
        
        this.showHint(step);
        this.currentStep++;
        setTimeout(() => this.checkStep(), 100);
    },
    
    showHint(step) {
        // Remove previous hints
        document.querySelectorAll('.onboarding-hint').forEach(el => el.remove());
        
        const target = document.querySelector(step.highlight);
        if (!target) return;
        
        const hint = document.createElement('div');
        hint.className = 'onboarding-hint';
        hint.innerHTML = `
            <div class="hint-arrow"></div>
            <div class="hint-message">${step.message}</div>
        `;
        
        // Position hint near target
        const rect = target.getBoundingClientRect();
        hint.style.position = 'fixed';
        hint.style.top = (rect.bottom + 10) + 'px';
        hint.style.left = rect.left + 'px';
        
        document.body.appendChild(hint);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hint.classList.add('fade-out');
            setTimeout(() => hint.remove(), 500);
        }, 5000);
    }
};
```

2. Balance validation:
```javascript
// In game.js
const BalanceValidator = {
    milestones: [
        { time: 30, resource: 'juniorDevs', expected: 1, name: 'First automation' },
        { time: 180, resource: 'money', expected: 500, name: 'Department unlock' },
        { time: 600, resource: 'money', expected: 10000, name: '10K milestone' }
    ],
    
    results: [],
    
    start() {
        this.startTime = Date.now();
        this.milestones.forEach(milestone => {
            setTimeout(() => {
                this.checkMilestone(milestone);
            }, milestone.time * 1000);
        });
    },
    
    checkMilestone(milestone) {
        const actual = milestone.resource === 'money' ? 
            GameState.resources.money : 
            GameState.units[milestone.resource];
        
        const result = {
            name: milestone.name,
            expected: milestone.expected,
            actual: actual,
            time: milestone.time,
            passed: actual >= milestone.expected
        };
        
        this.results.push(result);
        console.log('Balance check:', result);
        
        // Log to analytics if available
        if (window.analytics) {
            window.analytics.track('balance_milestone', result);
        }
    },
    
    generateReport() {
        const report = {
            totalPassed: this.results.filter(r => r.passed).length,
            totalFailed: this.results.filter(r => !r.passed).length,
            details: this.results
        };
        
        console.table(this.results);
        return report;
    }
};
```

**CSS for onboarding:**
```css
.onboarding-hint {
    background: #2196F3;
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 3000;
    animation: bounce 0.5s ease-out;
    max-width: 300px;
}

.hint-arrow {
    position: absolute;
    top: -10px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #2196F3;
}

@keyframes bounce {
    0% { transform: translateY(-20px); opacity: 0; }
    50% { transform: translateY(5px); }
    100% { transform: translateY(0); opacity: 1; }
}

.onboarding-hint.fade-out {
    animation: fadeOut 0.5s ease-out forwards;
}
```

**Testing Requirements:**
- [ ] First automation achieved within 30 seconds
- [ ] Department unlock within 3 minutes
- [ ] $10K milestone within 10 minutes
- [ ] Onboarding hints appear at correct times
- [ ] Hints don't interfere with gameplay
- [ ] Balance progression feels natural

---

## Implementation Order

### Phase 1: Foundation (Days 1-2)
1. TECH-001: Project Setup
2. TECH-002: Game State Management
3. TECH-003: Manual Code Writing
4. TECH-004: Resource Display System

### Phase 2: Core Mechanics (Days 3-4)
5. TECH-005: Junior Developer Automation
6. TECH-006: Feature Shipping System
7. TECH-007: Save System Implementation

### Phase 3: Expansion (Days 5-6)
8. TECH-008: Department System - Sales
9. TECH-009: Developer Tier System
10. TECH-010: Visual Polish and Feedback

### Phase 4: Polish (Days 7-8)
11. TECH-011: Achievement System
12. TECH-012: Audio System
13. TECH-013: Performance Optimization
14. TECH-014: Core Loop Validation

## Testing Checklist

### Unit Tests
- [ ] Game state updates correctly
- [ ] Resource calculations accurate
- [ ] Cost scaling formulas work
- [ ] Save/load preserves all data
- [ ] Number formatting handles all ranges

### Integration Tests
- [ ] Click → Resource → Display flow
- [ ] Purchase → Production → Automation flow
- [ ] Save → Reload → Offline progress flow
- [ ] Department unlock → Lead generation → Conversion flow

### Performance Tests
- [ ] 60 FPS with 100 units
- [ ] No memory leaks over 1 hour
- [ ] Save size < 100KB
- [ ] Load time < 1 second
- [ ] Smooth on mobile devices

### User Experience Tests
- [ ] Onboarding clear without tutorial
- [ ] Progress feels rewarding
- [ ] No confusing UI elements
- [ ] Achievements unlock properly
- [ ] Audio enhances experience

## Notes for Junior Developers

1. **Start Small**: Implement one feature at a time, test it thoroughly before moving on
2. **Use Console**: Log important values to console during development
3. **Test Often**: Run the game after each change to catch bugs early
4. **Ask Questions**: If any requirement is unclear, ask before implementing
5. **Code Style**: Follow the patterns established in early tasks
6. **Comments**: Add comments for complex logic, but keep code self-documenting
7. **Version Control**: Commit working code frequently with clear messages

Remember: The goal is to create an engaging, polished experience. Take time to play-test your implementations and ensure they feel good to interact with!