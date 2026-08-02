import { GestureHandlerRootView } from 'react-native-gesture-handler';
import VLibrasDemo from './VLibrasDemo';
import { VLibrasProvider } from 'react-native-vlibras';

export default function App() {
  return (
    <GestureHandlerRootView>
      <VLibrasProvider>
        <VLibrasDemo />
      </VLibrasProvider>
    </GestureHandlerRootView>
  );
}
