import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import {
  useVLibrasRegisterPressAction,
  useVLibrasTranslationContext,
  withVLibrasTranslationContext,
} from 'react-native-vlibras';

function DemoPressable({
  children,
  style,
  onPress: onPressOriginal,
  ...props
}: PressableProps) {
  useVLibrasRegisterPressAction(onPressOriginal);
  const { onPress } = useVLibrasTranslationContext();
  return (
    <Pressable
      style={{ ...styles.container, ...style }}
      onPress={onPress}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export default withVLibrasTranslationContext(DemoPressable);

const styles = StyleSheet.create({
  container: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
  },
});
