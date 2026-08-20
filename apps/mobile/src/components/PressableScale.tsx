import { Pressable, type PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ReactNode } from 'react';

export function PressableScale({
  children,
  onPress,
  style,
  disabled = false,
  scaleTo = 0.96,
  accessibilityRole,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  scaleTo?: number;
  accessibilityRole?: PressableProps['accessibilityRole'];
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 16, stiffness: 320, mass: 0.6 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 280, mass: 0.6 });
      }}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}