import React from 'react'
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { useScrapGeneration } from './hooks/useScrapGeneration'
import { formatNumber } from '../attack-button/utils/formatNumber'

interface ScrapCounterProps {
  petCount: number
  style?: StyleProp<ViewStyle>
}

/**
 * Displays scrap count and generation rate with fine-grained reactivity
 *
 * @param petCount - Current number of pets (drives generation)
 * @param style - Optional style override
 */
export function ScrapCounter({ petCount, style }: ScrapCounterProps) {
  const { scrap$, generationRate$ } = useScrapGeneration(petCount)

  return (
    <View style={[styles.container, style]}>
      {/* Scrap Count - Only re-renders when scrap changes */}
      <Memo>
        {() => (
          <Text style={styles.scrapText}>
            Scrap: {formatNumber(scrap$.get())}
          </Text>
        )}
      </Memo>

      {/* Generation Rate - Only re-renders when rate changes */}
      <Memo>
        {() => {
          const rate = generationRate$.get()
          return (
            <Text style={styles.rateText}>
              +{rate.toFixed(1)}/sec
            </Text>
          )
        }}
      </Memo>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrapText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700', // Gold color for scrap
    marginBottom: 4,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.8,
  },
})
