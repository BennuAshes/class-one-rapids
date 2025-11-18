import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SkillsScreen } from './SkillsScreen';
import { gameState$, resetGameState } from '../../shared/store/gameStore';
import { SKILLS } from './skillDefinitions';

describe('SkillsScreen', () => {
  const mockNavigateBack = jest.fn();

  beforeEach(() => {
    resetGameState();
    mockNavigateBack.mockClear();
  });

  describe('Header and Navigation', () => {
    test('renders header with title', () => {
      const { getByText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      expect(getByText('Skills')).toBeTruthy();
    });

    test('renders back button', () => {
      const { getByText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      expect(getByText('Back')).toBeTruthy();
    });

    test('back button calls onNavigateBack', () => {
      const { getByText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      const backButton = getByText('Back');
      fireEvent.press(backButton);
      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skills List', () => {
    test('renders skills list when skills exist', () => {
      gameState$.skills.set(SKILLS);
      const { getByText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      expect(getByText('Painting')).toBeTruthy();
    });

    test('displays locked skills correctly', () => {
      gameState$.skills.set(SKILLS);
      gameState$.unlockedSkills.set([]);
      const { getByText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);

      expect(getByText('Painting')).toBeTruthy();
      expect(getByText(/Locked/i)).toBeTruthy();
    });

    test('displays unlocked skills correctly', () => {
      gameState$.skills.set(SKILLS);
      gameState$.unlockedSkills.set(['painting']);
      const { getByText, queryByText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);

      expect(getByText('Painting')).toBeTruthy();
      expect(queryByText(/Locked/i)).toBeNull();
    });
  });

  describe('Skill Toggle', () => {
    test('toggle switch appears for unlocked skills', () => {
      gameState$.skills.set(SKILLS);
      gameState$.unlockedSkills.set(['painting']);
      const { UNSAFE_getAllByType } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);

      const switches = UNSAFE_getAllByType(require('react-native').Switch);
      expect(switches.length).toBeGreaterThan(0);
    });

    test('toggle switch reflects active state', () => {
      gameState$.skills.set(SKILLS);
      gameState$.unlockedSkills.set(['painting']);
      gameState$.activeSkills.set(['painting']);

      const { UNSAFE_getAllByType } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      const switches = UNSAFE_getAllByType(require('react-native').Switch);

      expect(switches[0].props.value).toBe(true);
    });

    test('toggle switch can be toggled', () => {
      gameState$.skills.set(SKILLS);
      gameState$.unlockedSkills.set(['painting']);
      gameState$.activeSkills.set([]);

      const { UNSAFE_getAllByType } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      const switches = UNSAFE_getAllByType(require('react-native').Switch);

      fireEvent(switches[0], 'valueChange', true);
      expect(gameState$.activeSkills.get()).toContain('painting');
    });
  });

  describe('Accessibility', () => {
    test('back button has accessibility attributes', () => {
      const { getByLabelText } = render(<SkillsScreen onNavigateBack={mockNavigateBack} />);
      const backButton = getByLabelText('Go back');
      expect(backButton).toBeTruthy();
      expect(backButton.props.accessibilityRole).toBe('button');
    });
  });
});
