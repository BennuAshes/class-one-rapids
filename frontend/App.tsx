import { SafeAreaProvider } from "react-native-safe-area-context";
import { Memo } from '@legendapp/state/react';
import { ClickerScreen } from './modules/attack-button/ClickerScreen';
import { ShopScreen } from './modules/shop/ShopScreen';
import { useNavigation } from './shared/hooks/useNavigation';

export default function App() {
  const { currentScreen$ } = useNavigation();

  return (
    <SafeAreaProvider>
      <Memo>
        {() => (
          currentScreen$.get() === 'clicker' ? (
            <ClickerScreen />
          ) : (
            <ShopScreen />
          )
        )}
      </Memo>
    </SafeAreaProvider>
  );
}
