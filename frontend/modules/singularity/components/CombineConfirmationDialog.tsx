import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';

export interface CombineConfirmationDialogProps {
  visible: boolean;
  currentPetCount: number;
  combineCost: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for combining AI Pets into Big Pets.
 * Shows cost, current count, benefits, and trade-offs.
 */
export const CombineConfirmationDialog: React.FC<CombineConfirmationDialogProps> = ({
  visible,
  currentPetCount,
  combineCost,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityLabel="Combine confirmation dialog"
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Combine AI Pets</Text>

          <Text style={styles.message}>
            Do you want to combine {combineCost} AI Pets into 1 Big Pet?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Big Pet Benefits:</Text>
            <Text style={styles.infoText}>
              • Higher singularity rate (0.01 vs 0.0001)
            </Text>
            <Text style={styles.infoText}>
              • Generate 0.5 scrap/second
            </Text>
            <Text style={styles.infoText}>
              • Can become Singularity Pets
            </Text>
            <Text style={styles.warningText}>
              ⚠ Trade-off: Less total scrap generation
            </Text>
          </View>

          <View style={styles.stats}>
            <Text style={styles.statsText}>
              Current AI Pets: {currentPetCount}
            </Text>
            <Text style={styles.statsText}>
              Cost: {combineCost} AI Pets
            </Text>
            <Text style={styles.statsText}>
              After: {currentPetCount - combineCost} AI Pets + 1 Big Pet
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel combination"
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirm combination"
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.confirmButtonText}>Combine</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333333',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#FF9500',
    marginTop: 8,
    fontWeight: '500',
  },
  stats: {
    marginBottom: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    minWidth: 44,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
