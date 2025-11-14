import { useEffect, useMemo } from 'react'
import { computed, Observable } from '@legendapp/state'
import { scrapStore } from '../stores/scrap.store'
import { SCRAP_CONSTRAINTS } from '../types'
import { validateScrap } from '../utils/scrapValidation'

export interface UseScrapGenerationReturn {
  scrap$: Observable<number>
  generationRate$: Observable<number> // scrap per second
}

/**
 * Provides tick-based scrap generation behavior
 *
 * @param petCount - Current number of pets (drives generation rate)
 * @returns Observable scrap count and computed generation rate
 *
 * @example
 * const { scrap$, generationRate$ } = useScrapGeneration(petCount)
 * <Memo>{() => <Text>{scrap$.get()}</Text>}</Memo>
 */
export function useScrapGeneration(petCount: number): UseScrapGenerationReturn {
  // Start tick timer when component mounts and app is active
  useEffect(() => {
    // Only run timer if there are pets
    if (petCount <= 0) {
      return
    }

    // Set up tick interval
    const intervalId = setInterval(() => {
      const scrapGained = petCount * 1 // 1 scrap per pet per tick
      const currentScrap = scrapStore.scrap.get()
      const newScrap = validateScrap(currentScrap + scrapGained)

      scrapStore.scrap.set(newScrap)
      scrapStore.lastTickTime.set(Date.now())
    }, SCRAP_CONSTRAINTS.TICK_INTERVAL_MS)

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [petCount])

  // Computed generation rate (scrap per second)
  const generationRate$ = useMemo(() =>
    computed(() => petCount / (SCRAP_CONSTRAINTS.TICK_INTERVAL_MS / 1000))
  , [petCount])

  return useMemo(() => ({
    scrap$: scrapStore.scrap,
    generationRate$
  }), [generationRate$])
}
