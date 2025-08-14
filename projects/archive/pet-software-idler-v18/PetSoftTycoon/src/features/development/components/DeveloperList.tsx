import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDevelopment } from '../state/developmentStore';
import { usePlayer } from '../../core/state/playerStore';

export const DeveloperList: React.FC = () => {
  const { developers, hireDeveloper, currentDeveloperCost } = useDevelopment();
  const { money, canAfford } = usePlayer();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Developers</Text>
      {developers.get().map((dev) => {
        const cost = currentDeveloperCost(dev.type);
        const affordable = canAfford(cost);
        
        return (
          <View key={dev.id} style={styles.developerRow}>
            <View style={styles.developerInfo}>
              <Text style={styles.developerType}>
                {dev.type.charAt(0).toUpperCase() + dev.type.slice(1)} Developer
              </Text>
              <Text style={styles.developerStats}>
                Owned: {dev.count} | Production: {dev.production}/s
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.hireButton, !affordable && styles.disabledButton]}
              onPress={() => affordable && hireDeveloper(dev.type, money.get())}
              disabled={!affordable}
            >
              <Text style={[styles.buttonText, !affordable && styles.disabledText]}>
                Hire ${cost.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  developerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
  },
  developerInfo: {
    flex: 1,
  },
  developerType: {
    fontSize: 16,
    fontWeight: '600',
  },
  developerStats: {
    fontSize: 14,
    color: '#666',
  },
  hireButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#888',
  },
});