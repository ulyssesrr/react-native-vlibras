import { GestureHandlerRootView } from 'react-native-gesture-handler';
import VLibrasDemo from './VLibrasDemo';
import Showcase from './Showcase';
import { VLibrasProvider } from 'react-native-vlibras';

// 'vitrine' é a tela gravada no GIF do README; 'testes' é a bancada usada
// para testar mudanças na biblioteca.
const SCREEN: 'vitrine' | 'testes' = 'vitrine';

export default function App() {
  return (
    <GestureHandlerRootView>
      <VLibrasProvider>
        {SCREEN === 'vitrine' ? <Showcase /> : <VLibrasDemo />}
      </VLibrasProvider>
    </GestureHandlerRootView>
  );
}
