import { useState } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClickerScreen } from "./modules/attack-button/ClickerScreen";
import { ShopScreen } from "./modules/shop/ShopScreen";

type Screen = 'main' | 'shop';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  return (
    <SafeAreaProvider>
      {currentScreen === 'main' ? (
        <ClickerScreen onNavigateToShop={() => setCurrentScreen('shop')} />
      ) : (
        <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
      )}
    </SafeAreaProvider>
  );
}
