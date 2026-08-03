import {
  Children,
  useCallback,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type View,
} from 'react-native';
import { useVLibras } from './VLibrasProvider';

interface TooltipWrapperProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  content: ReactNode;
}

export function VLibrasTooltipWrapper({
  children,
  onPress,
  ...rest
}: TooltipWrapperProps) {
  const ref = useRef<View>(null);
  const { status: vLibrasStatus, show } = useVLibras();
  const translationEnabled = vLibrasStatus === 'active';

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (translationEnabled && ref.current && onPress) {
        show(ref as RefObject<View>, () => {
          onPress(e);
        });
      }
    },
    [translationEnabled, show, onPress]
  );

  const child = Children.only(children);

  if (!translationEnabled) {
    return <>{children}</>;
  }

  return (
    <Pressable ref={ref} onPress={handlePress} {...rest}>
      {child}
    </Pressable>
  );
}
