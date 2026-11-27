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

/** Margens, em px, que uma view arrastável não pode invadir. */
export interface VLibrasDragInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

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
  /** Tamanho da view, para mantê-la inteira dentro da área de arrasto. */
  width: number;
  height: number;
  /** Margens já normalizadas (sem valores ausentes, negativos ou inválidos). */
  insets: Required<VLibrasDragInsets>;
  initialX?: number;
  initialY?: number;
}

export const VLibrasDraggableView = ({
  headerContent,
  onHeaderPress,
  sharedX,
  sharedY,
  children,
  width,
  height,
  insets,
  initialX = 0,
  initialY = 0,
  style,
}: PropsWithChildren<DraggableViewProps>) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  // Se a view não couber entre as margens (ex.: player em landscape), o
  // limite mínimo prevalece: ela fica encostada na margem superior/esquerda e
  // o header continua alcançável, em vez de ficar preso fora da tela.
  const minX = insets.left;
  const maxX = Math.max(minX, windowWidth - width - insets.right);
  const minY = insets.top;
  const maxY = Math.max(minY, windowHeight - height - insets.bottom);

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
      x.value = clamp(x.value, minX, maxX);
      y.value = clamp(y.value, minY, maxY);
    })
    .onUpdate((e) => {
      const changeX = e.translationX - prevTranslateX.value;
      prevTranslateX.value = e.translationX;
      const changeY = e.translationY - prevTranslateY.value;
      prevTranslateY.value = e.translationY;

      x.value = clamp(x.value + changeX, minX, maxX);
      y.value = clamp(y.value + changeY, minY, maxY);
    })
    .onEnd(() => {
      if (y.value < minY) {
        y.value = withSpring(minY);
      } else if (y.value > maxY) {
        y.value = withSpring(maxY);
      }

      if (x.value < minX) {
        x.value = withSpring(minX);
      } else if (x.value > maxX) {
        x.value = withSpring(maxX);
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
        { translateX: clamp(x.value, minX, maxX) },
        { translateY: clamp(y.value, minY, maxY) },
      ],
    };
  }, [x, y, minX, maxX, minY, maxY]);

  return (
    <Animated.View style={[style, animatedStyle]}>
      <GestureDetector gesture={gesture}>
        <View collapsable={false}>{headerContent}</View>
      </GestureDetector>
      {children}
    </Animated.View>
  );
};
