import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { useThemedStyles } from '../contexts/ThemeContext';
import { radius, spacing, type Palette } from '../theme';

export function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: p.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: p.border,
      padding: spacing.lg,
      marginTop: 4,
    },
    cardTitle: { color: p.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
    cardSubtitle: { color: p.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
    cardBody: { marginTop: 20, gap: 14 },
  });
