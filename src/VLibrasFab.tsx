import {
  Image,
  Pressable,
  StyleSheet,
  type ImageStyle,
  type PressableProps,
} from 'react-native';

export interface VLibrasFabProps extends PressableProps {
  onPress?: () => void;
  size?: number;
  borderRadius?: ImageStyle['borderRadius'];
}

export const VLIBRAS_ICON = require('./assets/libras.png');

export const FAB_SIZE = 56;

/**
 * Botão do VLibras apenas visual, sem estilos de posicionamento: quem o
 * renderiza é responsável por posicioná-lo.
 */
export function VLibrasFab({
  style,
  size = FAB_SIZE,
  borderRadius = 8,
  ...props
}: VLibrasFabProps) {
  return (
    <Pressable
      style={(state) => [
        styles.fab,
        { width: size, height: size, borderRadius },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
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
