import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

export interface ContextMenuOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  options: ContextMenuOption[];
}

export function ContextMenu({ visible, onClose, options }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {options.map((option, index) => (
                <View key={option.label}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={styles.option}
                    activeOpacity={0.65}
                    onPress={() => {
                      onClose();
                      option.onPress();
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={option.destructive ? Colors.dark.destructive : Colors.dark.textSecondary}
                    />
                    <Text style={[styles.label, option.destructive && styles.labelDestructive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 280,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    paddingVertical: Spacing[2],
    ...Shadow.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  separator: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: Spacing[5],
  },
  label: {
    fontSize: Typography.size.base,
    color: Colors.dark.text,
    fontWeight: Typography.weight.medium,
  },
  labelDestructive: {
    color: Colors.dark.destructive,
  },
});
