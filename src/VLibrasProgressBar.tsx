import { View, StyleSheet, type ViewProps } from 'react-native';
import type { VLibrasSimplePlayerHandle } from './VLibrasWebPlayerWrapper';
import { useState } from 'react';
import { useEffect } from 'react';

export interface VLibrasProgressBarProps extends ViewProps {
  player: VLibrasSimplePlayerHandle;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
}

export function VLibrasProgressBar({
  player,
  height = 8,
  backgroundColor = '#E5E7EB',
  fillColor = '#3B82F6',
  ...rest
}: VLibrasProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    return player.addListener('animationProgress', (e) => {
      setProgress(e.index / e.length);
    });
  }, [player]);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor,
        },
        rest.style,
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            width: `${clamped * 100}%`,
            borderRadius: height / 2,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: '100%',
  },
  track: {
    flex: 1,
  },
});
