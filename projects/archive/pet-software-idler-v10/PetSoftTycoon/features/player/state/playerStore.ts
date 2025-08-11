import { observable } from '@legendapp/state'
import { PlayerState, PlayerActions } from '../types/player.types'
import { emit } from '@shared/utils/eventBus'

export const playerStore = observable<PlayerState>({
  valuation: 1000,
  cash: 100,
  level: 1,
  experience: 0,
  totalRevenue: 0,
  statistics: {
    totalCashEarned: 0,
    totalClicks: 0,
    sessionStartTime: Date.now(),
    totalTimePlayed: 0
  }
})

export const playerActions: PlayerActions = {
  earnCash: (amount: number) => {
    playerStore.cash.set(prev => prev + amount)
    playerStore.totalRevenue.set(prev => prev + amount)
    playerStore.statistics.totalCashEarned.set(prev => prev + amount)
    
    emit({ type: 'revenue_earned', amount })
  },

  spendCash: (amount: number): boolean => {
    const currentCash = playerStore.cash.get()
    if (currentCash >= amount) {
      playerStore.cash.set(currentCash - amount)
      return true
    }
    return false
  },

  addExperience: (amount: number) => {
    const currentExp = playerStore.experience.get()
    const newExp = currentExp + amount
    
    // Level up check (100 exp per level)
    const newLevel = Math.floor(newExp / 100) + 1
    const currentLevel = playerStore.level.get()
    
    playerStore.experience.set(newExp)
    
    if (newLevel > currentLevel) {
      playerStore.level.set(newLevel)
    }
  },

  recordClick: () => {
    playerStore.statistics.totalClicks.set(prev => prev + 1)
  }
}