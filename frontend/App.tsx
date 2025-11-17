import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AttackButtonScreen } from "./modules/attack-button/AttackButtonScreen";
import { ShopScreen } from "./modules/shop/ShopScreen";
import { initializeGameState } from "./shared/store/gameStore";

type Screen = 'main' | 'shop';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  useEffect(() => {
    initializeGameState();
  }, []);

  return (
    <SafeAreaProvider>
      {currentScreen === 'main' ? (
        <AttackButtonScreen onNavigateToShop={() => setCurrentScreen('shop')} />
      ) : (
        <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
      )}
    </SafeAreaProvider>
  );
}
