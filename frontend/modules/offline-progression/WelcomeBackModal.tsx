import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { OfflineRewards } from './types';

export interface WelcomeBackModalProps {
  rewards: OfflineRewards | null;
  isVisible: boolean;
  onCollect: () => void;
  timeAway?: number; // For simple welcome message when no rewards
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  rewards,
  isVisible,
  onCollect,
  timeAway = 0
}) => {
  if (!isVisible) return null;

  // Show rewards if meaningful rewards exist
  if (rewards && rewards.enemiesDefeated > 0) {
    return (
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.rewardsContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text>You were away for {rewards.timeOffline} minutes</Text>
            <Text>{rewards.enemiesDefeated} Enemies Defeated</Text>
            <Text>+{rewards.xpGained} XP</Text>
            <Text>+{rewards.pyrealGained} Pyreal</Text>
            <TouchableOpacity onPress={onCollect}>
              <Text style={styles.collectButton}>Tap to Collect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show simple welcome message for minimal time away
  if (timeAway > 0) {
    return (
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.simpleContainer}>
            <Text style={styles.welcomeText}>
              Welcome back! You were away for {timeAway} minutes
            </Text>
            <TouchableOpacity onPress={onCollect}>
              <Text style={styles.collectButton}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  simpleContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  collectButton: {
    fontSize: 18,
    color: '#FF5722',
    fontWeight: 'bold',
    marginTop: 10,
  },
});