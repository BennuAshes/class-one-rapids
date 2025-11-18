import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';
import { gameState$ } from '../../shared/store/gameStore';
import { toggleSkill } from './skillEngine';
import { Skill, SkillRequirement } from '../../shared/types/game';

interface SkillsScreenProps {
  onNavigateBack: () => void;
}

/**
 * Screen displaying all available skills with unlock requirements and toggle controls.
 */
export const SkillsScreen = observer(({ onNavigateBack }: SkillsScreenProps) => {
  const { skills$, unlockedSkills$, activeSkills$ } = useGameState();

  const skills = skills$.get();
  const unlockedSkills = unlockedSkills$.get();
  const activeSkills = activeSkills$.get();

  const handleToggleSkill = (skillId: string, active: boolean) => {
    const currentState = gameState$.get();
    const updatedState = toggleSkill(currentState, skillId, active);
    gameState$.set(updatedState);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onNavigateBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Skills</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {skills.length === 0 ? (
          <Text style={styles.emptyText}>No skills available</Text>
        ) : (
          skills.map((skill) => {
            const isUnlocked = unlockedSkills.includes(skill.id);
            const isActive = activeSkills.includes(skill.id);

            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                isUnlocked={isUnlocked}
                isActive={isActive}
                onToggle={(active) => handleToggleSkill(skill.id, active)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

interface SkillCardProps {
  skill: Skill;
  isUnlocked: boolean;
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

/**
 * Card component displaying a single skill with its details and toggle control.
 */
const SkillCard: React.FC<SkillCardProps> = ({ skill, isUnlocked, isActive, onToggle }) => {
  const formatRequirement = (req: SkillRequirement): string => {
    switch (req.type) {
      case 'singularityPetCount':
        return `${req.value} Singularity Pet${req.value !== 1 ? 's' : ''}`;
      case 'totalPets':
        return `${req.value} Total Pets`;
      case 'upgrade':
        return `Upgrade: ${req.value}`;
      case 'time':
        return `${req.value} seconds playtime`;
      default:
        return 'Unknown requirement';
    }
  };

  return (
    <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{skill.name}</Text>
          {!isUnlocked && <Text style={styles.lockedBadge}>Locked</Text>}
        </View>
        {isUnlocked && (
          <Switch
            value={isActive}
            onValueChange={onToggle}
            accessibilityLabel={`Toggle ${skill.name}`}
          />
        )}
      </View>

      <Text style={styles.cardDescription}>{skill.description}</Text>

      {!isUnlocked && (
        <View style={styles.requirementContainer}>
          <Text style={styles.requirementLabel}>Unlock Requirement:</Text>
          <Text style={styles.requirementText}>
            {formatRequirement(skill.unlockRequirement)}
          </Text>
        </View>
      )}

      {isUnlocked && (
        <View style={styles.effectContainer}>
          <Text style={styles.effectLabel}>Effect:</Text>
          <Text style={styles.effectText}>{skill.effectType}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardLocked: {
    borderColor: '#CCCCCC',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginRight: 8,
  },
  lockedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
  },
  requirementContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  requirementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#333333',
  },
  effectContainer: {
    backgroundColor: '#E7F9E7',
    padding: 12,
    borderRadius: 8,
  },
  effectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  effectText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
});
