import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useRef, useState, type Ref } from 'react';
import {
  VLibrasWebPlayerWrapper,
  type VLibrasSimplePlayerHandle,
  type VLibrasWebPlayerWrapperProps,
} from './VLibrasWebPlayerWrapper';
import { VLibrasDraggableView } from './VLibrasDraggableView';
import {
  VLibrasPlayButton,
  VLibrasPlayerHeader,
  VLibrasToggleSubtitleButton,
} from './VLibrasButtons';
import { VLibrasProgressBar } from './VLibrasProgressBar';
import { useVLibras } from './VLibrasProvider';
import { useMergedRef } from './useVLibrasWrapper';

export interface VLibrasPlayerProps extends Omit<
  VLibrasWebPlayerWrapperProps,
  'speed' | 'showSubtitles'
> {
  playerRef: Ref<VLibrasSimplePlayerHandle>;
}

const DEFAULT_PLAYER_WIDTH = 210;
const DEFAULT_PLAYER_HEIGHT = 350;

export default function VLibrasPlayer({
  playerRef,
  onPlayerStatusChange,
  ...props
}: VLibrasPlayerProps) {
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [speed, setSpeed] = useState(1.0);

  const localPlayerRef = useRef<VLibrasSimplePlayerHandle>(null);
  const player = localPlayerRef?.current;

  const mergedRef = useMergedRef<VLibrasSimplePlayerHandle>(
    localPlayerRef,
    playerRef
  );

  const { setTranslationEnabled, playerSize } = useVLibras();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const effectiveWidth = playerSize?.width ?? DEFAULT_PLAYER_WIDTH;
  const effectiveHeight = playerSize?.height ?? DEFAULT_PLAYER_HEIGHT;

  return (
    <VLibrasDraggableView
      headerContent={
        <VLibrasPlayerHeader
          onClose={() => {
            setTranslationEnabled(false);
          }}
        />
      }
      style={[
        styles.playerContainer,
        { width: effectiveWidth, height: effectiveHeight },
      ]}
      maxWidth={windowWidth - effectiveWidth}
      maxHeight={windowHeight - effectiveHeight}
      initialX={50}
      initialY={50}
    >
      <VLibrasWebPlayerWrapper
        speed={speed}
        ref={mergedRef}
        showSubtitles={showSubtitles}
        onPlayerStatusChange={(e) => {
          if (e.status !== 'loading') {
            setPlayerLoaded(true);
          }
          onPlayerStatusChange?.(e);
        }}
        {...props}
      />

      {playerLoaded && player && (
        <View style={styles.controlsContainer}>
          <VLibrasPlayButton player={player} />
          <VLibrasProgressBar player={player} />
          <Text
            style={styles.speedControl}
            onPress={() =>
              setSpeed((val) => {
                let newSpeed = val + 0.5;
                if (newSpeed > 3) {
                  newSpeed = 0.5;
                }
                return newSpeed;
              })
            }
          >
            {speed.toFixed(1)}x
          </Text>
          <VLibrasToggleSubtitleButton
            showSubtitles={showSubtitles}
            toggleSubtitles={setShowSubtitles}
          />
        </View>
      )}
    </VLibrasDraggableView>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  speedControl: {
    fontWeight: 700,
  },
  controlsContainer: {
    padding: 5,
    gap: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
  },
});

// function VLibrasPlayerHeader() {
//   return (
//     <View
//       style={{
//         height: 40,
//         padding: 0,
//         margin: 0,
//         backgroundColor: '#15479c',
//         borderTopLeftRadius: 8,
//         borderTopRightRadius: 8,
//       }}
//     >
//       <Text style={{
//         color: 'white'
//       }}>VLIBRAS</Text>
//     </View>
//   );
// }
