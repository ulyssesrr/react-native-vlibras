import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { useEffect, useRef, type PropsWithChildren, type Ref } from 'react';
import { useImperativeHandle } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Emitter, type Listener } from 'strict-event-emitter';

// 1. Define a type that describes your events.
// Set event names as the keys, and their expected payloads as values.
type Events = {
  playerStatusChange: [event: VLibrasPlayertatusEventProps];
  animationStatusChange: [event: VLibrasAnimationStatusEventProps];
  animationPlay: [event: VLibrasAnimationEventProps];
  animationPause: [event: VLibrasAnimationEventProps];
  animationEnd: [event: VLibrasAnimationEventProps];
  animationProgress: [event: VLibrasAnimationProgressEventProps];
};

export interface VLibrasSimplePlayerHandle {
  translate: (text: string) => void;
  pause: () => void;
  resume: () => void;
  getStatus: () => PlayerStatus;
  addListener: <EventName extends keyof Events>(
    eventName: EventName,
    listener: Listener<Events[EventName]>
  ) => () => void;
}

export type AnimationStatus = 'idle' | 'playing' | 'paused';

export type PlayerStatus = 'loading' | AnimationStatus;
export interface VLibrasAnimationEventProps {
  text: string;
}

export interface VLibrasAnimationProgressEventProps {
  text: string;
  index: number;
  length: number;
}

export interface VLibrasAnimationStatusEventProps {
  text: string;
  status: AnimationStatus;
}

export interface VLibrasPlayertatusEventProps {
  text?: string;
  status: PlayerStatus;
}

export interface VLibrasWebPlayerWrapperProps {
  uri?: string;
  speed?: number;
  showSubtitles?: boolean;
  onPlayerStatusChange?: (props: VLibrasPlayertatusEventProps) => void;
  onAnimationStatusChange?: (props: VLibrasAnimationStatusEventProps) => void;
  onAnimationPlay?: (props: VLibrasAnimationEventProps) => void;
  onAnimationPause?: (props: VLibrasAnimationEventProps) => void;
  onAnimationEnd?: (props: VLibrasAnimationEventProps) => void;
  onAnimationProgress?: (props: VLibrasAnimationProgressEventProps) => void;
}

function createEventListenerScript(eventName: string): string {
  const eventNameEscaped = JSON.stringify(eventName);
  return `
    window.player.on(${eventNameEscaped}, function (...args) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        name: ${eventNameEscaped},
        args: args
      }))
    });
    true;
  `;
}

function createCanvasReadyListener(canvasId: string, callbackScript: string) {
  return `
    function runOnceWhenElementAppears(id, callback) {
      const existing = document.getElementById(id);
      if (existing) {
        callback(existing);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.getElementById(id);
        if (element) {
          observer.disconnect();
          callback(element);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    // Usage
    runOnceWhenElementAppears(${JSON.stringify(canvasId)}, ${callbackScript});
  `;
}

export function VLibrasWebPlayerWrapper({
  ref,
  uri = 'https://vlibras-player-webjs.pages.dev/',
  onPlayerStatusChange,
  onAnimationStatusChange,
  onAnimationPlay,
  onAnimationPause,
  onAnimationEnd,
  onAnimationProgress,
  speed = 1.0,
  showSubtitles = false,
}: PropsWithChildren<VLibrasWebPlayerWrapperProps> & {
  ref: Ref<VLibrasSimplePlayerHandle>;
}) {
  const webviewRef = useRef<WebView>(null);
  const translateText = useRef<string>(null);
  const playerStatus = useRef<PlayerStatus>('loading');

  const isPlaying = () => playerStatus.current === 'playing';

  const emitter = useRef(new Emitter<Events>()).current;

  useImperativeHandle(ref, () => ({
    translate(text: string) {
      translateText.current = text;
      const script = `
        if (typeof window.player?.translate === 'function') {
          window.player.translate(${JSON.stringify(text)});
        }
        true;
      `;
      webviewRef.current?.injectJavaScript(script);
    },
    pause() {
      const script = `
        if (typeof window.player?.pause === 'function') {
          window.player.pause();
        }
        true;
      `;
      webviewRef.current?.injectJavaScript(script);
    },
    resume() {
      const script = `
        if (typeof window.player?.continue === 'function') {
          window.player.continue();
        }
        true;
      `;
      webviewRef.current?.injectJavaScript(script);
    },
    getStatus() {
      return playerStatus.current;
    },
    addListener: <EventName extends keyof Events>(
      eventName: EventName,
      listener: Listener<Events[EventName]>
    ) => {
      emitter.addListener(eventName, listener);
      // console.log(
      //   'Registered listerner for ',
      //   eventName,
      //   emitter.listenerCount(eventName)
      // );
      return () => {
        // console.log(
        //   'Unregistered listerner for ',
        //   eventName,
        //   emitter.listenerCount(eventName)
        // );

        emitter.removeListener(eventName, listener);
      };
    },
  }));

  const syncSpeesState = () => {
    const script = `
      window.player?.setSpeed(${speed});
      true;
    `;
    webviewRef.current?.injectJavaScript(script);
  };
  useEffect(syncSpeesState, [speed]);

  const syncSubtitleState = () => {
    const script = `
      if (window.player.playerManager.subtitle !== ${showSubtitles}) {
        window.player?.toggleSubtitle();
      }
      true;
    `;
    webviewRef.current?.injectJavaScript(script);
  };
  useEffect(syncSubtitleState, [showSubtitles]);

  const runFirst = `
    // const originalEmit = window.player.emit.bind(window.player);
    // window.player.emit = (...args) => {
    //   alert("emit:"+ JSON.stringify(args));
    //   return originalEmit(...args);
    // };
    ${createCanvasReadyListener(
      '#canvas',
      `(elem) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          name: 'custom:canvas:ready'
        }))
      }`
    )}
    ${createEventListenerScript('load')}
    ${createEventListenerScript('response:glosa')}
    ${createEventListenerScript('animation:play')}
    ${createEventListenerScript('animation:pause')}
    ${createEventListenerScript('animation:end')}
    true; // note: this is required, or you'll sometimes get silent failures
  `;

  function updateStatus(text: string, newStatus: AnimationStatus) {
    if (playerStatus.current !== newStatus) {
      playerStatus.current = newStatus;
      const event = {
        text,
        status: newStatus,
      };
      emitter.emit('playerStatusChange', event);
      emitter.emit('animationStatusChange', event);
      onPlayerStatusChange?.(event);
      onAnimationStatusChange?.(event);
    }
  }

  const eventHandler = (name: string, args: any) => {
    if (translateText.current) {
      if (name === 'response:glosa') {
        console.log(name, args);
        if (Array.isArray(args) && args.length === 2) {
          const index: number = args[0];
          const length: number = args[1];
          const event = {
            text: translateText.current,
            index,
            length,
          };
          emitter.emit('animationProgress', event);
          onAnimationProgress?.(event);
        }
      } else if (!isPlaying() && name === 'animation:play') {
        updateStatus(translateText.current, 'playing');
        const event = {
          text: translateText.current,
        };
        emitter.emit('animationPlay', event);
        onAnimationPlay?.(event);
      } else if (isPlaying() && name === 'animation:end') {
        updateStatus(translateText.current, 'idle');
        const event = {
          text: translateText.current,
        };
        emitter.emit('animationEnd', event);
        onAnimationEnd?.(event);
      } else if (isPlaying() && name === 'animation:pause') {
        updateStatus(translateText.current, 'paused');
        const event = {
          text: translateText.current,
        };
        emitter.emit('animationPause', event);
        onAnimationPause?.(event);
      }
    } else if (name === 'load') {
      syncCanvasToLayout();
      onPlayerStatusChange?.({
        status: 'idle',
      });
      syncSubtitleState();
    } else if (name === 'custom:canvas:ready') {
      console.log('custom:canvas:ready');
      syncCanvasToLayout();
    }
  };

  const syncCanvasToLayout = () => {
    const script = `
      document.body.style.margin = 0;
      document.getElementById('#canvas').width = window.innerWidth;
      document.getElementById('#canvas').height = window.innerHeight;
      true;
    `;
    webviewRef.current?.injectJavaScript(script);
  };

  return (
    <WebView
      style={styles.container}
      onLayout={(_e: LayoutChangeEvent) => {
        syncCanvasToLayout();
      }}
      ref={webviewRef}
      injectedJavaScript={runFirst}
      originWhitelist={['*']}
      source={{ uri }}
      onMessage={(event: WebViewMessageEvent) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);
          eventHandler(message.name, message.args);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 0,
  },
});
