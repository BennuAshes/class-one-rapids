import { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ClickerScreen } from "./modules/attack-button/ClickerScreen"
import { ShopScreen } from "./modules/shop/ShopScreen"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'clicker' | 'shop'>('clicker')

  return (
    <SafeAreaProvider>
      {currentScreen === 'shop' ? (
        <ShopScreen onBack={() => setCurrentScreen('clicker')} />
      ) : (
        <ClickerScreen onNavigateToShop={() => setCurrentScreen('shop')} />
      )}
    </SafeAreaProvider>
  )
}
