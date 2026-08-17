import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { palette, radius, spacing } from '../theme';

export function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18,37,51,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    marginTop: 4,
  },
  cardTitle: { color: palette.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  cardSubtitle: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  cardBody: { marginTop: 20, gap: 14 },
});