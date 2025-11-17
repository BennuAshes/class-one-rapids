import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClickerScreen } from "./modules/attack-button/ClickerScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <ClickerScreen />
    </SafeAreaProvider>
  );
}
