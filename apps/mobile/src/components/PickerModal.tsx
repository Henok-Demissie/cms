import { Modal, Pressable, Text, StyleSheet, View } from 'react-native';
import { useThemedStyles } from '../contexts/ThemeContext';
import { radius, type Palette } from '../theme';

export function PickerModal({
  visible,
  options,
  onClose,
  onSelect,
}: {
  visible: boolean;
  options: { label: string; value: string }[];
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const styles = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={styles.modalItem}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              <Text style={styles.modalItemText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    modalBackdrop: { flex: 1, backgroundColor: p.overlay, justifyContent: 'center', padding: 28 },
    modalCard: {
      backgroundColor: p.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: p.border,
      overflow: 'hidden',
    },
    modalItem: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: p.border },
    modalItemText: { color: p.text, fontSize: 16 },
  });
