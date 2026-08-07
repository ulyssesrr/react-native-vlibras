import { Text, StyleSheet, type TextProps } from 'react-native';
import {
  useVLibrasRegisterTranslationText,
  withVLibrasTranslationContext,
} from 'react-native-vlibras';

export type DemoTextProps = TextProps & {
  text: string;
};

function DemoText({ text, style, ...props }: DemoTextProps) {
  useVLibrasRegisterTranslationText(text);
  return (
    <Text style={{ ...styles.text, ...style }} {...props}>
      {text}
    </Text>
  );
}

export default withVLibrasTranslationContext(DemoText);

const styles = StyleSheet.create({
  text: {
    color: 'blue',
  },
});
