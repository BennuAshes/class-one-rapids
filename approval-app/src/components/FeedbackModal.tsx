import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Card,
  Title,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import FeedbackForm, { FeedbackData } from './FeedbackForm';

interface FeedbackModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (feedback: FeedbackData) => void | Promise<void>;
  checkpoint: string;
  executionId: string;
  loading?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  checkpoint,
  executionId,
  loading = false,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState<FeedbackData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate that at least one field has content
    if (
      !feedback.specific_issues &&
      !feedback.missing_elements &&
      !feedback.suggested_improvements
    ) {
      // In a production app, you might want to show an error message
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      // Clear form after successful submission
      setFeedback({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFeedback({});
    onDismiss();
  };

  const isValid =
    feedback.specific_issues ||
    feedback.missing_elements ||
    feedback.suggested_improvements;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
        style={styles.modal}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>📝 Provide Feedback</Title>
            <Text style={styles.subtitle}>
              Checkpoint: {checkpoint}
            </Text>
            <Text style={styles.executionId}>
              Execution ID: {executionId}
            </Text>

            <ScrollView
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <FeedbackForm
                initialData={feedback}
                onFeedbackChange={setFeedback}
                showRating={true}
                compact={false}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                disabled={isSubmitting || loading}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!isValid || isSubmitting || loading}
                loading={isSubmitting || loading}
                style={styles.button}
                buttonColor={theme.colors.error}
              >
                Submit Feedback & Reject
              </Button>
            </View>

            {(isSubmitting || loading) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
  },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  card: {
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  executionId: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
  },
  formContainer: {
    maxHeight: 400,
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  button: {
    marginHorizontal: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedbackModal;