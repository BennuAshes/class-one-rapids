import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Text,
  SegmentedButtons,
  useTheme,
  HelperText
} from 'react-native-paper';

export interface FeedbackData {
  specific_issues?: string;
  missing_elements?: string;
  suggested_improvements?: string;
  rating?: number;
  summary?: string;
}

interface FeedbackFormProps {
  initialData?: FeedbackData;
  onFeedbackChange?: (feedback: FeedbackData) => void;
  showRating?: boolean;
  compact?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  initialData = {},
  onFeedbackChange,
  showRating = true,
  compact = false
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState<FeedbackData>(initialData);

  const updateFeedback = (field: keyof FeedbackData, value: string | number) => {
    const updated = { ...feedback, [field]: value };
    setFeedback(updated);
    onFeedbackChange?.(updated);
  };

  const ratingOptions = [
    { value: '1', label: '1', showSelectedCheck: true },
    { value: '2', label: '2', showSelectedCheck: true },
    { value: '3', label: '3', showSelectedCheck: true },
    { value: '4', label: '4', showSelectedCheck: true },
    { value: '5', label: '5', showSelectedCheck: true },
  ];

  const getRatingText = (rating?: number) => {
    const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return texts[rating || 0];
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Specific Issues"
        value={feedback.specific_issues || ''}
        onChangeText={(text) => updateFeedback('specific_issues', text)}
        mode="outlined"
        multiline
        numberOfLines={compact ? 2 : 3}
        placeholder="What specific problems did you find?"
        style={styles.input}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
      />

      <TextInput
        label="Missing Elements"
        value={feedback.missing_elements || ''}
        onChangeText={(text) => updateFeedback('missing_elements', text)}
        mode="outlined"
        multiline
        numberOfLines={compact ? 2 : 3}
        placeholder="What's missing or unclear?"
        style={styles.input}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
      />

      <TextInput
        label="Suggested Improvements"
        value={feedback.suggested_improvements || ''}
        onChangeText={(text) => updateFeedback('suggested_improvements', text)}
        mode="outlined"
        multiline
        numberOfLines={compact ? 2 : 3}
        placeholder="How should this be improved?"
        style={styles.input}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
      />

      {showRating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Quality Rating</Text>
          <SegmentedButtons
            value={feedback.rating?.toString() || ''}
            onValueChange={(value) => updateFeedback('rating', parseInt(value))}
            buttons={ratingOptions}
            style={styles.ratingButtons}
          />
          {feedback.rating && (
            <HelperText type="info" visible={true}>
              {getRatingText(feedback.rating)}
            </HelperText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  ratingContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  ratingButtons: {
    marginBottom: 4,
  },
});

export default FeedbackForm;