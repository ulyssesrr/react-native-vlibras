import type {
  TextProps,
  Text,
  Pressable,
  GestureResponderEvent,
  NativeMethods,
} from 'react-native';
import { useVLibras } from './VLibrasProvider';
import { useRef, type ComponentPropsWithRef, type Ref } from 'react';

export function useMergedRef<T>(
  ...refs: (Ref<T> | undefined)[]
): React.RefObject<T> {
  return ((value: T) => {
    for (const ref of refs) {
      if (!ref) continue;

      if (typeof ref === 'function') {
        ref(value);
      } else {
        ref.current = value;
      }
    }
  }) as any as React.RefObject<T>;
}

export type VLibrasWrapperProps = Pick<
  ComponentPropsWithRef<typeof Pressable>,
  'ref' | 'onPress'
>;

export type UseVLibrasTouchableWrapperReturn<TRef extends NativeMethods> = {
  ref?: React.RefObject<TRef | null>;
  onPress?: (event: GestureResponderEvent) => void;
};

export type UseVLibrasTouchableWrapperProps<TRef extends NativeMethods> =
  UseVLibrasTouchableWrapperReturn<TRef> & {
    text: string;
  };

export function useVLibrasTouchableWrapper<TRef extends NativeMethods>({
  ref: originalRef,
  text,
  onPress: onPressImpl,
}: UseVLibrasTouchableWrapperProps<TRef>): UseVLibrasTouchableWrapperReturn<TRef> {
  const { status, show, translate } = useVLibras();
  const localRef = useRef<TRef>(null);
  const ref = useMergedRef(localRef, originalRef);

  if (status === 'active') {
    const onPress: TextProps['onPress'] = (event) => {
      translate(text);

      if (onPressImpl) {
        show(localRef, () => {
          onPressImpl(event);
        });
      }
    };
    return {
      ref,
      onPress,
    };
  } else {
    return {
      ref,
      onPress: onPressImpl,
    };
  }
}

export type VLibrasTextWrapperProps = Pick<
  ComponentPropsWithRef<typeof Text>,
  'ref' | 'onPress'
>;

export type VLibrasTextWrapperReturn = Pick<
  ComponentPropsWithRef<typeof Text>,
  'onPress'
> & {
  ref: React.RefObject<Text>;
};

export function useVLibrasTextWrapper({
  ref: originalRef,
  onPress: onTextPress,
}: VLibrasTextWrapperProps = {}): VLibrasTextWrapperReturn {
  const { status, show, translate } = useVLibras();
  const localRef = useRef<Text>(null);
  const ref = useMergedRef(localRef, originalRef);

  if (status === 'active') {
    const onPress: TextProps['onPress'] = (event) => {
      const text = localRef.current?.childNodes[0]?.nodeValue;
      if (text) {
        translate(text);
      } else {
        console.error('No text found! for ref', localRef);
      }

      if (onTextPress) {
        show(localRef, () => {
          onTextPress(event);
        });
      }
    };
    return {
      ref,
      onPress,
    };
  } else {
    return {
      ref,
      onPress: onTextPress,
    };
  }
}
