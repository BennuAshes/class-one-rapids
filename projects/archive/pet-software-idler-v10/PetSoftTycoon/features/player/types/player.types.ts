export interface PlayerState {
  valuation: number
  cash: number
  level: number
  experience: number
  totalRevenue: number
  statistics: {
    totalCashEarned: number
    totalClicks: number
    sessionStartTime: number
    totalTimePlayed: number
  }
}

export interface PlayerActions {
  earnCash: (amount: number) => void
  spendCash: (amount: number) => boolean
  addExperience: (amount: number) => void
  recordClick: () => void
}