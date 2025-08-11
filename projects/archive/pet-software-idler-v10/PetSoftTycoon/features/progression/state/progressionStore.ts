import { observable } from '@legendapp/state'
import { ProgressionState } from '../types/progression.types'

export const progressionStore = observable<ProgressionState>({
  achievements: [],
  milestones: [],
  prestigeLevel: 0,
  investorPoints: 0
})

export const progressionActions = {
  unlockAchievement: (achievementId: string) => {
    const achievements = progressionStore.achievements.get()
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
    }
  }
}