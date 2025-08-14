import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDevelopment } from '../state/developmentStore';
import { usePlayer } from '../../core/state/playerStore';
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber';
import { DeveloperList } from './DeveloperList';

export const DevelopmentTab: React.FC = () => {
  const { linesOfCode, writeCode } = useDevelopment();
  const { money } = usePlayer();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Development Department</Text>
        <AnimatedNumber 
          value={linesOfCode.get()} 
          style={styles.counter}
          formatter={(v) => `${v.toLocaleString()} lines of code`}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.writeCodeButton}
        onPress={() => writeCode()}
      >
        <Text style={styles.buttonText}>Write Code</Text>
      </TouchableOpacity>
      
      <DeveloperList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counter: {
    fontSize: 18,
    color: '#2196F3',
  },
  writeCodeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});