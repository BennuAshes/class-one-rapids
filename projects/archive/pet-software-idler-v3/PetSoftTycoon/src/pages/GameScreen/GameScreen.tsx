import React from 'react';
import { ScrollView, View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ResourceDisplay } from '../../widgets/ResourceDisplay';
import { WriteCodeButton } from '../../features/writeCode';
import { gameState$ } from '../../app/store/gameStore';

export const GameScreen: React.FC = observer(() => {
  const departments = gameState$.departments.get();
  const unlockedDepartments = Object.values(departments).filter(dept => dept.unlocked);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Game Title */}
        <View style={styles.header}>
          <Text style={styles.title}>PetSoft Tycoon</Text>
          <Text style={styles.subtitle}>Build Your Pet Tech Empire</Text>
        </View>

        {/* Resource Display */}
        <ResourceDisplay />

        {/* Main Action Button */}
        <View style={styles.actionSection}>
          <WriteCodeButton />
        </View>

        {/* Departments Section */}
        <View style={styles.departmentsSection}>
          <Text style={styles.sectionTitle}>Departments ({unlockedDepartments.length}/7)</Text>
          {unlockedDepartments.map(department => (
            <View key={department.id} style={styles.departmentCard}>
              <Text style={styles.departmentName}>{department.name}</Text>
              <Text style={styles.departmentStatus}>
                {department.units.length > 0 ? `${department.units.length} units` : 'No units yet'}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress Info */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Next Department: {getNextDepartmentInfo(departments)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

// Helper function to get next department unlock info
const getNextDepartmentInfo = (departments: Record<string, any>): string => {
  const locked = Object.values(departments).filter((dept: any) => !dept.unlocked);
  if (locked.length === 0) return 'All departments unlocked!';
  
  const next = locked.reduce((prev: any, curr: any) => 
    curr.unlockThreshold < prev.unlockThreshold ? curr : prev
  ) as { name: string; unlockThreshold: number };
  
  return `${next.name} at $${next.unlockThreshold.toLocaleString()}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  actionSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  departmentsSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  departmentCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  departmentStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
});