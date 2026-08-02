import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageProps,
  type ImageRequireSource,
  type PressableProps,
} from 'react-native';
import type { VLibrasSimplePlayerHandle } from './VLibrasWebPlayerWrapper';
import { useEffect, useState } from 'react';

export const CLOSE_IMAGE: ImageRequireSource = require('./assets/xmark-solid-full.png');

export const PLAY_IMAGE: ImageRequireSource = require('./assets/play-solid-full.png');

export const PAUSE_IMAGE: ImageRequireSource = require('./assets/pause-solid-full.png');

export const REPLAY_IMAGE: ImageRequireSource = require('./assets/arrow-rotate-right-solid-full.png');

export const SUBTITLE_ON_IMAGE: ImageRequireSource = require('./assets/message-solid-full.png');

export const SUBTITLE_OFF_IMAGE: ImageRequireSource = require('./assets/message-regular-full.png');

interface VLibrasImageButtonBaseProps extends PressableProps {
  imageSource: ImageProps['source'];
  imageWidth?: ImageProps['width'];
  imageHeight?: ImageProps['height'];
  disabled?: boolean;
}

export function VLibrasImageButton({
  imageSource,
  imageWidth = 28,
  imageHeight = 28,
  ...props
}: VLibrasImageButtonBaseProps) {
  return (
    <Pressable {...props}>
      <Image
        source={imageSource}
        style={{ width: imageWidth, height: imageHeight }}
      />
    </Pressable>
  );
}

interface VLibrasImageButtonDefaultProps extends Omit<
  VLibrasImageButtonBaseProps,
  'imageSource'
> {
  player: VLibrasSimplePlayerHandle;
}

type ButtonAction = 'none' | 'pause' | 'play' | 'replay';

const ButtonIcon: Record<ButtonAction, ImageRequireSource> = {
  none: PLAY_IMAGE,
  pause: PAUSE_IMAGE,
  play: PLAY_IMAGE,
  replay: REPLAY_IMAGE,
};

export function VLibrasPlayButton({
  player,
  ...props
}: VLibrasImageButtonDefaultProps) {
  const [playerStatus, setPlayerStatus] = useState(player.getStatus());
  const [lastText, setLastText] = useState<string>();

  useEffect(() => {
    const unsubscribe = player.addListener('playerStatusChange', (e) => {
      console.log('VLibrasPlayButton', 'playerStatusChange', e);
      setPlayerStatus(e.status);
      setLastText(e.text);
    });
    return () => {
      unsubscribe();
    };
  }, [player]);

  const disabled = playerStatus === 'loading';

  const buttonAction = ((): ButtonAction => {
    switch (playerStatus) {
      case 'loading':
        return 'none';
      case 'idle':
        return lastText ? 'replay' : 'none';
      case 'playing':
        return 'pause';
      case 'paused':
        return 'play';
    }
  })();

  const onPress = () => {
    if (buttonAction === 'play') {
      player.resume();
    } else if (buttonAction === 'replay') {
      player.translate(lastText!);
    } else if (buttonAction === 'pause') {
      player.pause();
    }
  };

  return (
    <VLibrasImageButton
      disabled={disabled}
      imageSource={ButtonIcon[buttonAction]}
      onPress={onPress}
      {...props}
    />
  );
}

interface VLibrasToggleSubtitleButtonProps extends Omit<
  VLibrasImageButtonBaseProps,
  'imageSource'
> {
  showSubtitles: boolean;
  toggleSubtitles: (setter: (currentValue: boolean) => boolean) => void;
}

export function VLibrasToggleSubtitleButton({
  showSubtitles,
  toggleSubtitles,
  ...props
}: VLibrasToggleSubtitleButtonProps) {
  return (
    <VLibrasImageButton
      imageSource={showSubtitles ? SUBTITLE_ON_IMAGE : SUBTITLE_OFF_IMAGE}
      onPress={() => toggleSubtitles((currentValue) => !currentValue)}
      {...props}
    />
  );
}

export function VLibrasCloseButton(
  props: Omit<VLibrasImageButtonBaseProps, 'imageSource'>
) {
  return <VLibrasImageButton imageSource={CLOSE_IMAGE} {...props} />;
}

export type VLibrasPlayerHeaderProps = {
  onClose: () => void;
};

export function VLibrasPlayerHeader({ onClose }: VLibrasPlayerHeaderProps) {
  return (
    <View style={styles.parentContainer}>
      {/* Left Container (2 children) */}
      <View style={[styles.subContainer, styles.leftAlign]}>
        {/* <Text style={styles.title}>L1</Text>
        <Text style={styles.title}>L2</Text> */}
      </View>

      {/* Center Container (1 child) */}
      <View style={[styles.subContainer, styles.centerAlign]}>
        <Text style={styles.title}>VLIBRAS</Text>
      </View>

      {/* Right Container (2 children) */}
      <View style={[styles.subContainer, styles.rightAlign]}>
        <VLibrasCloseButton style={styles.title} onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    backgroundColor: '#15479c',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 4,
  },
  subContainer: {
    flex: 1, // Forces all 3 sections to occupy identical width
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAlign: {
    justifyContent: 'flex-start',
  },
  centerAlign: {
    justifyContent: 'center',
  },
  rightAlign: {
    justifyContent: 'flex-end',
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 700,
    padding: 4,
  },
});
