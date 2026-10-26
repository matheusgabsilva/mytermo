import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { useTheme } from '../ThemeProvider';

export interface ToastProps {
  /** Increment to trigger a new toast. Stays hidden when 0 or unchanged. */
  showKey: number;
  message: string;
  /** Visible duration before fade-out. Default 1500ms. */
  duration?: number;
  /** Vertical offset from the parent's top edge. Default 80. */
  topOffset?: number;
}

/**
 * Floating message that pops in, holds, and fades out. Driven by a counter
 * (`showKey`) so the same `message` can be re-shown by incrementing the key.
 * Pointer-events disabled — never blocks touches underneath.
 */
export function Toast({ showKey, message, duration = 1500, topOffset = 80 }: ToastProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const [capturedMessage, setCapturedMessage] = useState(message);

  useEffect(() => {
    if (!showKey) return;
    setCapturedMessage(message);
    opacity.stopAnimation();
    opacity.setValue(1);
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }, duration);
    return () => clearTimeout(timer);
  }, [showKey]);

  if (!showKey) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          top: topOffset,
          backgroundColor: theme.colors.text,
          opacity,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.background,
          fontFamily: theme.typography.fontFamily.bold,
          fontWeight: '700',
          fontSize: theme.typography.sizes.body,
        }}
      >
        {capturedMessage}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    zIndex: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
