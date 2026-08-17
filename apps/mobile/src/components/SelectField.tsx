import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';

export function SelectField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.select} onPress={onPress}>
        <Text style={styles.selectText} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name="chevron-down" size={16} color={palette.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: palette.text, fontSize: 13, fontWeight: '600' },
  select: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    backgroundColor: palette.bgSoft,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { color: palette.text, fontSize: 15, flex: 1 },
});