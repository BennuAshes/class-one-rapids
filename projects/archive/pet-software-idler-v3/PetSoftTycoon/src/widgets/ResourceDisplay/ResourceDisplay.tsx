import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { gameState$ } from '../../app/store/gameStore';
import { formatNumber } from '../../shared/lib/numberUtils';

export const ResourceDisplay: React.FC = observer(() => {
  const resources = gameState$.resources.get();

  return (
    <View style={styles.container}>
      <ResourceItem 
        label="Lines of Code" 
        value={resources.linesOfCode} 
        color="#4CAF50"
        icon="💻"
      />
      <ResourceItem 
        label="Money" 
        value={resources.money} 
        color="#FFC107"
        icon="💰"
        prefix="$"
      />
      <ResourceItem 
        label="Features" 
        value={resources.features} 
        color="#9C27B0"
        icon="⭐"
      />
      <ResourceItem 
        label="Customers" 
        value={resources.customers} 
        color="#FF5722"
        icon="👥"
      />
    </View>
  );
});

interface ResourceItemProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  prefix?: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ 
  label, 
  value, 
  color, 
  icon, 
  prefix = '' 
}) => (
  <View style={styles.resourceItem} testID={`resource-${label.toLowerCase().replace(' ', '-')}`}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.resourceInfo}>
      <Text style={styles.resourceLabel}>{label}</Text>
      <Text style={[styles.resourceValue, { color }]}>
        {prefix}{formatNumber(value)}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
    marginVertical: 5,
    paddingHorizontal: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
});