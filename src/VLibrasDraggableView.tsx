import { type PropsWithChildren, type ReactNode } from 'react';
import Animated, {
  clamp,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useWindowDimensions, View, type ViewProps } from 'react-native';
import { runOnJS } from 'react-native-worklets';

interface DraggableViewProps extends ViewProps {
  headerContent: ReactNode;
  /** Chamado quando o header é tocado sem ser arrastado. */
  onHeaderPress?: () => void;
  /**
   * Posição externa (deslocamento do canto superior esquerdo da view), para
   * que ela sobreviva à desmontagem deste componente e possa ser alterada de
   * fora. Valores fora dos limites são ajustados (clamp) ao desenhar.
   */
  sharedX?: SharedValue<number>;
  sharedY?: SharedValue<number>;
  maxHeight?: number;
  minHeight?: number;
  maxWidth?: number;
  minWidth?: number;
  initialX?: number;
  initialY?: number;
}

export const VLibrasDraggableView = ({
  headerContent,
  onHeaderPress,
  sharedX,
  sharedY,
  children,
  maxHeight,
  minHeight = 0,
  maxWidth,
  minWidth = 0,
  initialX = 0,
  initialY = 0,
  style,
}: PropsWithChildren<DraggableViewProps>) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  if (maxHeight === undefined) {
    maxHeight = windowHeight;
  }
  if (maxWidth === undefined) {
    maxWidth = windowWidth;
  }

  const localX = useSharedValue(initialX);
  const localY = useSharedValue(initialY);
  const x = sharedX ?? localX;
  const y = sharedY ?? localY;
  const prevTranslateX = useSharedValue(0);
  const prevTranslateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      prevTranslateX.value = 0;
      prevTranslateY.value = 0;
      // A posição guardada pode estar fora dos limites (escrita externa,
      // janela menor): o arrasto começa de onde a view está desenhada.
      x.value = clamp(x.value, minWidth, maxWidth);
      y.value = clamp(y.value, minHeight, maxHeight);
    })
    .onUpdate((e) => {
      const changeX = e.translationX - prevTranslateX.value;
      prevTranslateX.value = e.translationX;
      const changeY = e.translationY - prevTranslateY.value;
      prevTranslateY.value = e.translationY;

      x.value = clamp(x.value + changeX, minWidth, maxWidth);
      y.value = clamp(y.value + changeY, minHeight, maxHeight);
    })
    .onEnd(() => {
      if (y.value < minHeight) {
        y.value = withSpring(minHeight);
      } else if (y.value > maxHeight) {
        y.value = withSpring(maxHeight);
      }

      if (x.value < minWidth) {
        x.value = withSpring(minWidth);
      } else if (x.value > maxWidth) {
        x.value = withSpring(maxWidth);
      }
    });

  const tapGesture = Gesture.Tap().onEnd((_e, success) => {
    if (success && onHeaderPress) {
      runOnJS(onHeaderPress)();
    }
  });

  // Race: quando o pan ativa, o tap é cancelado, então soltar um arrasto
  // nunca conta como toque.
  const gesture = onHeaderPress
    ? Gesture.Race(panGesture, tapGesture)
    : panGesture;

  // Clamp no desenho: nenhum valor guardado coloca a view fora da tela, e
  // mudanças nos limites (ex.: rotação) valem sem alterar a posição guardada.
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: clamp(x.value, minWidth, maxWidth) },
        { translateY: clamp(y.value, minHeight, maxHeight) },
      ],
    };
  }, [x, y, minWidth, maxWidth, minHeight, maxHeight]);

  return (
    <Animated.View style={[style, animatedStyle]}>
      <GestureDetector gesture={gesture}>
        <View collapsable={false}>{headerContent}</View>
      </GestureDetector>
      {children}
    </Animated.View>
  );
};
