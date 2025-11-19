import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AttackButtonScreen } from "./modules/attack-button/AttackButtonScreen";
import { ShopScreen } from "./modules/shop/ShopScreen";
import { SkillsScreen } from "./modules/singularity/SkillsScreen";
import { initializeGameState } from "./shared/store/gameStore";

type Screen = 'main' | 'shop' | 'skills';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  useEffect(() => {
    initializeGameState();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'shop':
        return <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />;
      case 'skills':
        return <SkillsScreen onNavigateBack={() => setCurrentScreen('main')} />;
      case 'main':
      default:
        return (
          <AttackButtonScreen
            onNavigateToShop={() => setCurrentScreen('shop')}
            onNavigateToSkills={() => setCurrentScreen('skills')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
    </SafeAreaProvider>
  );
}
