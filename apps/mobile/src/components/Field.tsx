import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';

export function Field({
  label,
  value,
  onChange,
  placeholder,
  secure,
  toggle,
  onToggle,
  icon,
  keyboardType,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  toggle?: boolean;
  onToggle?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'phone-pad';
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <View style={styles.inputWrap}>
        {icon && <Ionicons name={icon} size={17} color={palette.muted} style={styles.inputIcon} />}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : undefined]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          secureTextEntry={secure && !toggle}
          autoCapitalize="none"
          keyboardType={keyboardType}
        />
        {secure && onToggle && (
          <Pressable onPress={onToggle} style={styles.eyeBtn} hitSlop={10}>
            <Ionicons name={toggle ? 'eye-off-outline' : 'eye-outline'} size={18} color={palette.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: palette.text, fontSize: 13, fontWeight: '600' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: 17, zIndex: 1 },
  input: {
    color: palette.text,
    backgroundColor: palette.bgSoft,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputWithIcon: { paddingLeft: 42 },
  eyeBtn: { position: 'absolute', right: 14, top: 15 },
});