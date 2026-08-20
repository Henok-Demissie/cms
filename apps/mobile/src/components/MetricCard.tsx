import { Text, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useThemedStyles } from '../contexts/ThemeContext';
import type { Palette } from '../theme';

export function MetricCard({
  label,
  value,
  icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  delay?: number;
}) {
  const styles = useThemedStyles(makeStyles);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.springify().damping(14).stiffness(110).delay(delay)} style={{ flex: 1 }}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 13, stiffness: 260 });
        }}
      >
        <Animated.View style={[styles.metric, animatedStyle]}>
          <View style={[styles.metricIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricLabel}>{label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    metric: {
      flex: 1,
      backgroundColor: p.surface,
      borderColor: p.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      gap: 6,
    },
    metricIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    metricValue: { color: p.text, fontSize: 24, fontWeight: '800' },
    metricLabel: { color: p.muted, fontSize: 12 },
  });
