import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { View, type GestureResponderEvent } from 'react-native';
import { useVLibrasTouchableWrapper } from './useVLibrasWrapper';

type RegisterTextFnType = (id: symbol, value: string) => () => void;

type OnPressFnType = (event: GestureResponderEvent) => void;

type RegisterActionnType = (
  id: symbol,
  value?: OnPressFnType | null
) => () => void;

interface VLibrasTranslateBlockContextValue {
  registerText: RegisterTextFnType;
  registerAction: RegisterActionnType;
  onPress?: OnPressFnType;
}

const VLibrasTranslateBlockContext =
  createContext<VLibrasTranslateBlockContextValue | null>(null);

export function useVLibrasTranslationContext(): VLibrasTranslateBlockContextValue {
  const ctx = useContext(VLibrasTranslateBlockContext);
  if (!ctx) {
    throw new Error(
      'useVLibrasTranslateBlock must be used within a VLibrasProvider'
    );
  }
  return ctx;
}

export function useVLibrasRegisterTranslationText(text: string) {
  const { registerText } = useVLibrasTranslationContext();
  const id = useMemo(() => Symbol(), []);
  useEffect(() => registerText(id, text), [id, text, registerText]);
}

export function useVLibrasRegisterPressAction(action?: OnPressFnType | null) {
  const { registerAction } = useVLibrasTranslationContext();
  const id = useMemo(() => Symbol(), []);
  useEffect(() => registerAction(id, action), [id, action, registerAction]);
}

function VLibrasTranslateBlockProviderImpl({ children }: PropsWithChildren) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const texts = useRef(new Map<symbol, string>());
  const registerText = useCallback((id: symbol, value: string) => {
    if (texts.current.get(id) !== value) {
      texts.current.set(id, value);
      forceUpdate();
    }

    return () => {
      if (texts.current.delete(id)) {
        forceUpdate();
      }
    };
  }, []);

  const onPressFns = useRef(new Map<symbol, OnPressFnType>());
  const registerAction = useCallback(
    (id: symbol, value?: OnPressFnType | null) => {
      if (onPressFns.current.get(id) !== value) {
        if (value) {
          onPressFns.current.set(id, value);
        } else {
          onPressFns.current.delete(id);
        }
        forceUpdate();
      }

      return () => {
        if (onPressFns.current.delete(id)) {
          forceUpdate();
        }
      };
    },
    []
  );

  const viewRef = useRef<View>(null);

  let onPressOriginal: OnPressFnType | undefined;
  const [firstActionEntry] = onPressFns.current;
  if (firstActionEntry) {
    const [, action] = firstActionEntry;
    onPressOriginal = action;
  }

  const { ref, onPress } = useVLibrasTouchableWrapper({
    ref: viewRef,
    onPress: onPressOriginal,
    text: Array.from(texts.current.values()).join(' '),
  });

  return (
    <VLibrasTranslateBlockContext.Provider
      value={{
        registerText,
        registerAction,
        onPress,
      }}
    >
      <View ref={ref}>{children}</View>
    </VLibrasTranslateBlockContext.Provider>
  );
}

export function VLibrasTranslateBlockProvider({ children }: PropsWithChildren) {
  const parent = useContext(VLibrasTranslateBlockContext);
  if (parent) {
    // Already inside VLibrasTranslateBlockContext
    return children;
  } else {
    return (
      <VLibrasTranslateBlockProviderImpl>
        {children}
      </VLibrasTranslateBlockProviderImpl>
    );
  }
}

export function withVLibrasTranslationContext<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  function WithTranslationContext(props: P) {
    return (
      <VLibrasTranslateBlockProvider>
        <Component {...props} />
      </VLibrasTranslateBlockProvider>
    );
  }

  WithTranslationContext.displayName = `withTranslationContext(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;

  return WithTranslationContext;
}
