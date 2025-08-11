export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  progress: number
  target: number
}

export interface ProgressionState {
  achievements: Achievement[]
  milestones: string[]
  prestigeLevel: number
  investorPoints: number
}