import { playerStore, playerActions } from '../state/playerStore'

describe('Player Store', () => {
  beforeEach(() => {
    // Reset store state
    playerStore.cash.set(100)
    playerStore.totalRevenue.set(0)
    playerStore.statistics.totalCashEarned.set(0)
  })

  it('should earn cash correctly', () => {
    playerActions.earnCash(50)
    
    expect(playerStore.cash.get()).toBe(150)
    expect(playerStore.totalRevenue.get()).toBe(50)
    expect(playerStore.statistics.totalCashEarned.get()).toBe(50)
  })

  it('should spend cash when sufficient funds', () => {
    const success = playerActions.spendCash(50)
    
    expect(success).toBe(true)
    expect(playerStore.cash.get()).toBe(50)
  })

  it('should reject spend when insufficient funds', () => {
    const success = playerActions.spendCash(200)
    
    expect(success).toBe(false)
    expect(playerStore.cash.get()).toBe(100)
  })

  it('should level up when gaining enough experience', () => {
    playerStore.level.set(1)
    playerStore.experience.set(0)
    
    playerActions.addExperience(150) // Should level up to level 2
    
    expect(playerStore.level.get()).toBe(2)
    expect(playerStore.experience.get()).toBe(150)
  })

  it('should record clicks correctly', () => {
    const initialClicks = playerStore.statistics.totalClicks.get()
    
    playerActions.recordClick()
    
    expect(playerStore.statistics.totalClicks.get()).toBe(initialClicks + 1)
  })
})