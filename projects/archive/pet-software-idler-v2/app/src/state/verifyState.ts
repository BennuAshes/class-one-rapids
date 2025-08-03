// Simple script to verify state functionality
import { gameState$, gameActions, productionRates$ } from './gameState';
import { saveGame } from './persistence';

console.log('🔍 Verifying Legend State v3 implementation...\n');

// Test 1: Initial state
console.log('1️⃣ Initial State:');
console.log('Lines of Code:', gameState$.resources.linesOfCode.get());
console.log('Money:', gameState$.resources.money.get());
console.log('Junior Devs:', gameState$.units.developers.junior.get());
console.log('');

// Test 2: Add resources
console.log('2️⃣ Adding 100 lines of code...');
gameActions.addLinesOfCode(100);
console.log('Lines of Code:', gameState$.resources.linesOfCode.get());
console.log('Total Lines Written:', gameState$.stats.totalLinesWritten.get());
console.log('');

// Test 3: Add money
console.log('3️⃣ Adding $50...');
gameActions.addMoney(50);
console.log('Money:', gameState$.resources.money.get());
console.log('Total Money Earned:', gameState$.stats.totalMoneyEarned.get());
console.log('');

// Test 4: Purchase units
console.log('4️⃣ Purchasing 2 junior developers...');
gameActions.purchaseUnit('developers', 'junior');
gameActions.purchaseUnit('developers', 'junior');
console.log('Junior Devs:', gameState$.units.developers.junior.get());
console.log('');

// Test 5: Check production rates
console.log('5️⃣ Production Rates:');
const rates = productionRates$.get();
console.log('Lines per second:', rates.linesPerSecond);
console.log('Leads per second:', rates.leadsPerSecond);
console.log('');

// Test 6: Save game
console.log('6️⃣ Saving game...');
saveGame();
console.log('');

// Test 7: Reset and verify persistence would work on reload
console.log('7️⃣ Simulating game reset (data should persist on real app restart)...');
const savedState = {
  linesOfCode: gameState$.resources.linesOfCode.get(),
  money: gameState$.resources.money.get(),
  juniorDevs: gameState$.units.developers.junior.get(),
};

gameActions.resetGame();
console.log('After reset - Lines of Code:', gameState$.resources.linesOfCode.get());
console.log('After reset - Money:', gameState$.resources.money.get());
console.log('After reset - Junior Devs:', gameState$.units.developers.junior.get());
console.log('');

console.log('✅ State verification complete!');
console.log('📝 Note: In a real app, MMKV persistence would restore the saved state on restart.');
console.log('Saved values were:', savedState);

export {};