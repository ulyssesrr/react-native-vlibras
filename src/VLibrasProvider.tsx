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
import { StyleSheet, View, type NativeMethods } from 'react-native';
import { VLibrasTooltipPortal } from './VLibrasTooltipPortal';
import { VLibrasFab } from './VLibrasFab';
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

interface VLibrasContextValue {
  status: VLibrasStatus;
  setTranslationEnabled: Dispatch<SetStateAction<boolean>>;
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

function VLibrasProviderImpl({ children }: PropsWithChildren) {
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [state, setState] = useState<VLibrasState | null>(null);

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
      show,
      hide,
    }),
    [status, translate, translationEnabled, show, hide]
  );

  return (
    <VLibrasContext.Provider value={contextValue}>
      <GestureDetector gesture={singleTap}>
        <View style={styles.container}>{children}</View>
      </GestureDetector>
      <VLibrasTooltipPortal state={state} />
      {!translationEnabled && (
        <VLibrasFab
          anchor="right"
          alignment="MIDDLE"
          onPress={() => {
            setTranslationEnabled(true);
          }}
        />
      )}
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

export function VLibrasProvider({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView>
      <VLibrasProviderImpl>{children}</VLibrasProviderImpl>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
