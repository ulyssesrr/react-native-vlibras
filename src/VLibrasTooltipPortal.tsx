import { useRef } from 'react';
import {
  Platform,
  StyleSheet,
  type ViewStyle,
  View,
  useWindowDimensions,
  Image,
  Pressable,
} from 'react-native';
import { PLAY_IMAGE } from './VLibrasButtons';

const BUBBLE_WIDTH = 48;
const BUBBLE_HEIGHT = 48;
const ARROW_SIZE = 16;
const ARROW_HEIGHT = Math.sqrt(2) * ARROW_SIZE;
const X_PADDING = 4;

interface AnchorInfo {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

interface TooltipState {
  anchor: AnchorInfo;
  onPress: () => void;
}

interface TooltipPortalProps {
  state: TooltipState | null;
}

export function VLibrasTooltipPortal({ state }: TooltipPortalProps) {
  const contentRef = useRef<View>(null);
  const { height: windowHeight } = useWindowDimensions();

  // const arrowLeft = clamp(
  //   bubble.arrowLeft,
  //   SAFE_AREA_EXTRA + ARROW_SIZE,
  //   x + bubble.width - SAFE_AREA_EXTRA - ARROW_SIZE
  // );

  if (!state) {
    return null;
  }

  const anchorX = state.anchor.x + X_PADDING;
  const anchorY = state.anchor.y;
  const anchorHeight = state.anchor.height;

  const bubbleStyle: ViewStyle = {
    position: 'absolute',
    left: anchorX,
    top: anchorY + state.anchor.height,
    width: BUBBLE_WIDTH,
    height: BUBBLE_HEIGHT,
  };

  const arrowLeft = anchorX;
  const arrowOffset = arrowLeft + ARROW_SIZE / 2;
  const arrowStyle: ViewStyle = {
    backgroundColor: '#15479c',
    position: 'absolute',
    left: arrowOffset,
    width: ARROW_SIZE,
    height: ARROW_SIZE,
  };

  const finalPlacement = anchorY > windowHeight / 2 ? 'top' : 'bottom';
  if (finalPlacement === 'top') {
    arrowStyle.top = anchorY - ARROW_HEIGHT;
    arrowStyle.transform = [{ rotate: '45deg' }];

    bubbleStyle.top = anchorY - ARROW_HEIGHT / 2 - BUBBLE_HEIGHT;
  } else {
    arrowStyle.top = anchorY + state.anchor.height + ARROW_SIZE / 2;
    arrowStyle.transform = [{ rotate: '45deg' }];

    bubbleStyle.top = anchorY + ARROW_HEIGHT / 2 + anchorHeight;
  }

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.portal]}
      pointerEvents="box-none"
    >
      <View style={[styles.bubble, bubbleStyle]} pointerEvents="box-none">
        <Pressable
          style={styles.bubbleContent}
          ref={contentRef}
          onPress={state.onPress}
          pointerEvents="box-none"
        >
          <Image style={styles.image} source={PLAY_IMAGE} />
        </Pressable>
      </View>
      <View style={arrowStyle} pointerEvents="box-none" />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 8,
    borderColor: '#15479c',
    borderWidth: 4,
    backgroundColor: 'white',
    pointerEvents: 'box-none',
    zIndex: 1,
  },
  bubbleContent: {},
  image: {
    resizeMode: 'contain',
    height: '100%',
    width: '100%',
  },
  portal: {
    ...Platform.select({
      web: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
      } as ViewStyle,
    }),
  },
});
