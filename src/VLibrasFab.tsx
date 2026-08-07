import {
  Image,
  Pressable,
  StyleSheet,
  type ImageStyle,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

export type VLibrasFabAnchor = 'top' | 'bottom' | 'left' | 'right';

export type VLibrasFabAlignment = 'START' | 'MIDDLE' | 'END';

export interface VLibrasFabProps extends PressableProps {
  onPress?: () => void;
  anchor?: VLibrasFabAnchor;
  alignment?: VLibrasFabAlignment;
  draggable?: boolean;
  size?: number;
  borderRadius?: ImageStyle['borderRadius'];
}

export const VLIBRAS_ICON = require('./assets/libras.png');

const FAB_SIZE = 56;

function resolveContainerStyle(
  size: number,
  anchor: VLibrasFabAnchor,
  alignment: VLibrasFabAlignment
): ViewStyle {
  const base: ViewStyle = {
    position: 'absolute',
    width: size,
    height: size,
    zIndex: 1,
  };

  if (anchor === 'left' || anchor === 'right') {
    base[anchor] = 0;
    if (alignment === 'START') {
      base.top = 0;
    } else if (alignment === 'END') {
      base.bottom = 0;
    } else {
      base.top = '50%';
      base.marginTop = -FAB_SIZE / 2;
    }
  } else {
    base[anchor] = 0;
    if (alignment === 'START') {
      base.left = 0;
    } else if (alignment === 'END') {
      base.right = 0;
    } else {
      base.left = '50%';
      base.marginLeft = -FAB_SIZE / 2;
    }
  }

  return base;
}

export function VLibrasFab({
  onPress,
  style,
  anchor = 'right',
  alignment = 'END',
  size = FAB_SIZE,
  borderRadius = 8,
}: VLibrasFabProps) {
  return (
    <Pressable
      style={[
        resolveContainerStyle(size, anchor, alignment),
        { borderRadius },
        styles.fab,
        { ...style },
      ]}
      onPress={onPress}
    >
      <Image
        source={VLIBRAS_ICON}
        style={[styles.image]}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    backgroundColor: '#3185ef',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
