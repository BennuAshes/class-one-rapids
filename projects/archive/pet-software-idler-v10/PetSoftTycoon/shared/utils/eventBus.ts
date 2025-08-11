import { observable } from '@legendapp/state'

export type GameEvent = 
  | { type: 'revenue_earned', amount: number }
  | { type: 'department_unlocked', department: string }
  | { type: 'achievement_earned', id: string }
  | { type: 'employee_hired', departmentId: string, employeeType: string }
  | { type: 'upgrade_purchased', departmentId: string, upgradeId: string }

export const eventBus = observable<GameEvent[]>([])

export const emit = (event: GameEvent): void => {
  eventBus.push(event)
  
  // Clear old events to prevent memory leaks
  if (eventBus.length > 1000) {
    eventBus.splice(0, 500)
  }
}

export const subscribe = (
  eventType: GameEvent['type'], 
  handler: (event: GameEvent) => void
): (() => void) => {
  return eventBus.onChange(({ value: events }) => {
    events.forEach((event: GameEvent) => {
      if (event.type === eventType) {
        handler(event)
      }
    })
  })
}