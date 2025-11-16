import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function App() {
  return (
    <SafeAreaProvider>
      <View>
        <Text>Hello World</Text>
      </View>
    </SafeAreaProvider>
  );
}
