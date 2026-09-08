import { type PropsWithChildren, type ReactNode } from 'react';
import Animated, {
  clamp,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useWindowDimensions, View, type ViewProps } from 'react-native';

interface DraggableViewProps extends ViewProps {
  headerContent: ReactNode;
  maxHeight?: number;
  minHeight?: number;
  maxWidth?: number;
  minWidth?: number;
  initialX?: number;
  initialY?: number;
}

export const VLibrasDraggableView = ({
  headerContent,
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
  if (!maxHeight) {
    maxHeight = windowHeight;
  }
  if (!maxWidth) {
    maxWidth = windowWidth;
  }

  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const prevTranslateX = useSharedValue(x.value);
  const prevTranslateY = useSharedValue(y.value);

  const gestureHandler = Gesture.Pan()
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
      prevTranslateX.value = 0;
      prevTranslateY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }, { translateY: y.value }],
    };
  }, [x.value, y.value]);

  return (
    <Animated.View style={[style, animatedStyle]}>
      <GestureDetector gesture={gestureHandler}>
        <View collapsable={false}>{headerContent}</View>
      </GestureDetector>
      {children}
    </Animated.View>
  );
};
