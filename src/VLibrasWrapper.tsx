import { useRef, type ComponentType } from "react"
import { Button, View, type ButtonProps, type ViewProps } from "react-native"
import { useVLibrasTouchableWrapper } from "./useVLibrasWrapper";

type VLibrasButtonWrapperProps<T extends ButtonProps> = {
  component?: ComponentType<T>;
  wrapperViewProps?: ViewProps;
} & T;


export function VLibrasButtonWrapper<T extends ButtonProps>({
  component: Component = Button as ComponentType<T>,
  wrapperViewProps,
  title,
  onPress: onButtonPress,
  ...otherButtonProps
}: VLibrasButtonWrapperProps<T>) {
  const viewRef = useRef<View>(null);
  const { onPress, ref } = useVLibrasTouchableWrapper({ text: title, onPress: onButtonPress, ref: viewRef });
  return (
    <View ref={ref} {...wrapperViewProps}>
      <Component {...(otherButtonProps as T)} onPress={onPress} title={title} />
    </View>
  );
}
