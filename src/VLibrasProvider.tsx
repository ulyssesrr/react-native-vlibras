import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type RefObject,
  useRef,
  type SetStateAction,
  type Dispatch,
  useEffect,
} from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeMethods,
} from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { VLibrasTooltipPortal } from './VLibrasTooltipPortal';
import { FAB_SIZE, VLibrasFab } from './VLibrasFab';
import { VLibrasDraggableView } from './VLibrasDraggableView';
import VLibrasPlayer from './VLibrasPlayer';
import type { VLibrasSimplePlayerHandle } from './VLibrasWebPlayerWrapper';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';

interface AnchorInfo {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

interface VLibrasState {
  anchor: AnchorInfo;
  onPress: () => void;
}

export interface VLibrasPlayerSize {
  width: number;
  height: number;
}

interface VLibrasContextValue {
  status: VLibrasStatus;
  setTranslationEnabled: Dispatch<SetStateAction<boolean>>;
  fabEnabled: boolean;
  setFabEnabled: Dispatch<SetStateAction<boolean>>;
  playerSize: VLibrasPlayerSize | undefined;
  setPlayerSize: Dispatch<SetStateAction<VLibrasPlayerSize | undefined>>;
  /**
   * Posição do FAB em uso: a do app (ver `VLibrasProviderProps`) ou a criada
   * pelo provider.
   */
  fabX: SharedValue<number>;
  fabY: SharedValue<number>;
  show: (
    anchorRef: RefObject<NativeMethods | null>,
    onPress: () => void
  ) => void;
  hide: () => void;
  translate: (text: string) => boolean;
}

const VLibrasContext = createContext<VLibrasContextValue | null>(null);

export function useVLibras(): VLibrasContextValue {
  const ctx = useContext(VLibrasContext);
  if (!ctx) {
    throw new Error('useVLibras must be used within a VLibrasProvider');
  }
  return ctx;
}

export type VLibrasStatus = 'inactive' | 'loading' | 'active';

export interface VLibrasProviderProps {
  /** Permite que o usuário arraste o FAB pela tela. Padrão: `true`. */
  fabDraggable?: boolean;
  /**
   * Posição do FAB controlada pelo app, para definir onde ele começa, movê-lo
   * ou salvá-la. É o deslocamento, em px, do canto superior esquerdo do FAB
   * em relação ao canto superior esquerdo do provider (use `FAB_SIZE` para
   * encostá-lo numa borda); posições fora da tela são ajustadas ao desenhar.
   * A que o app não informar é criada pelo provider, começando no meio da
   * borda direita.
   */
  fabX?: SharedValue<number>;
  fabY?: SharedValue<number>;
}

interface VLibrasDraggableFabProps {
  onPress: () => void;
  sharedX: SharedValue<number>;
  sharedY: SharedValue<number>;
}

function VLibrasDraggableFab({
  onPress,
  sharedX,
  sharedY,
}: VLibrasDraggableFabProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  return (
    <VLibrasDraggableView
      headerContent={
        // O toque vem do gesto de tap da view arrastável, então leitores de
        // tela precisam de outra forma de ativar o botão.
        <VLibrasFab
          accessibilityRole="button"
          accessibilityLabel="VLibras"
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={onPress}
        />
      }
      onHeaderPress={onPress}
      sharedX={sharedX}
      sharedY={sharedY}
      style={styles.fabDraggable}
      minWidth={0}
      maxWidth={windowWidth - FAB_SIZE}
      minHeight={0}
      maxHeight={windowHeight - FAB_SIZE}
    />
  );
}

function VLibrasProviderImpl({
  children,
  fabDraggable = true,
  fabX: externalFabX,
  fabY: externalFabY,
}: PropsWithChildren<VLibrasProviderProps>) {
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [fabEnabled, setFabEnabled] = useState(true);
  const [playerSize, setPlayerSize] = useState<VLibrasPlayerSize>();
  const [state, setState] = useState<VLibrasState | null>(null);

  // Fica aqui, e não no FAB, para que a posição sobreviva à desmontagem do
  // FAB enquanto o player está aberto.
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const internalFabX = useSharedValue(windowWidth - FAB_SIZE);
  const internalFabY = useSharedValue(windowHeight / 2 - FAB_SIZE / 2);
  const fabX = externalFabX ?? internalFabX;
  const fabY = externalFabY ?? internalFabY;

  const playerRef = useRef<VLibrasSimplePlayerHandle>(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  const status: VLibrasStatus = translationEnabled
    ? playerLoaded
      ? 'active'
      : 'loading'
    : 'inactive';

  const hide = useCallback(() => {
    setState(null);
  }, []);

  const show = useCallback(
    (anchorRef: RefObject<NativeMethods | null>, onPress: () => void) => {
      const onPressWithHide = () => {
        onPress();
        hide();
      };

      try {
        console.log('SHOW!', anchorRef.current);
        anchorRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
          console.log('measured!', _x, _y, width, height, pageX, pageY);
          setState({
            anchor: {
              x: pageX,
              y: pageY,
              width,
              height,
              pageX,
              pageY,
            },
            onPress: onPressWithHide,
          });
        });
      } catch (e: unknown) {
        console.error('Show tooltip error', e);
        // Anchor not measurable (not on screen yet)
      }
    },
    [hide]
  );

  useEffect(() => {
    if (!translationEnabled) {
      hide();
    }
  }, [hide, translationEnabled]);

  const handleTap = (x: number, y: number) => {
    if (state) {
      const inside =
        x >= state.anchor.x &&
        x <= state.anchor.x + state.anchor.width &&
        y >= state.anchor.y &&
        y <= state.anchor.y + state.anchor.height;

      if (!inside) {
        hide();
      }
    }
  };

  const singleTap = Gesture.Tap().onFinalize((event) => {
    runOnJS(handleTap)(event.x, event.y);
  });

  const translate = useCallback(
    (text: string) => {
      if (status === 'active') {
        playerRef.current?.translate(text);
        return true;
      }
      return false;
    },
    [status]
  );

  const contextValue: VLibrasContextValue = useMemo(
    () => ({
      status,
      translate,
      translationEnabled,
      setTranslationEnabled,
      fabEnabled,
      setFabEnabled,
      playerSize,
      setPlayerSize,
      fabX,
      fabY,
      show,
      hide,
    }),
    [
      status,
      translate,
      translationEnabled,
      fabEnabled,
      playerSize,
      fabX,
      fabY,
      show,
      hide,
    ]
  );

  const openPlayer = () => {
    setTranslationEnabled(true);
  };

  return (
    <VLibrasContext.Provider value={contextValue}>
      <GestureDetector gesture={singleTap}>
        <View style={styles.container}>{children}</View>
      </GestureDetector>
      <VLibrasTooltipPortal state={state} />
      {fabEnabled &&
        !translationEnabled &&
        (fabDraggable ? (
          <VLibrasDraggableFab
            onPress={openPlayer}
            sharedX={fabX}
            sharedY={fabY}
          />
        ) : (
          <VLibrasFab style={styles.fabFixed} onPress={openPlayer} />
        ))}
      {translationEnabled && (
        <VLibrasPlayer
          playerRef={playerRef}
          onPlayerStatusChange={(e) => {
            if (e.status !== 'loading') {
              setPlayerLoaded(true);
            }
          }}
        />
      )}
    </VLibrasContext.Provider>
  );
}

export function VLibrasProvider({
  children,
  ...props
}: PropsWithChildren<VLibrasProviderProps>) {
  return (
    <GestureHandlerRootView>
      <VLibrasProviderImpl {...props}>{children}</VLibrasProviderImpl>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fabDraggable: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
    elevation: 999,
  },
  fabFixed: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -FAB_SIZE / 2,
    zIndex: 1,
  },
});
