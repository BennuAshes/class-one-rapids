import { useState } from 'react'
import { ClickerScreen } from "./modules/attack-button/ClickerScreen"
import { ShopScreen } from "./modules/shop/ShopScreen"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'clicker' | 'shop'>('clicker')

  if (currentScreen === 'shop') {
    return <ShopScreen onBack={() => setCurrentScreen('clicker')} />
  }

  return <ClickerScreen onNavigateToShop={() => setCurrentScreen('shop')} />
}
