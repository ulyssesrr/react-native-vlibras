import { type PropsWithChildren, type ReactNode } from 'react';
import Animated, {
  clamp,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useWindowDimensions, type ViewProps } from 'react-native';

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

  const gestureHandler = usePanGesture({
    onUpdate: (e) => {
      x.value = clamp(x.value + e.changeX, minWidth, maxWidth);
      y.value = clamp(y.value + e.changeY, minHeight, maxHeight);
    },
    onDeactivate: () => {
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
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }, { translateY: y.value }],
    };
  }, [x.value, y.value]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <GestureDetector gesture={gestureHandler}>
        {headerContent}
      </GestureDetector>
      {children}
    </Animated.View>
  );
};
