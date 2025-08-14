// Resource Events
export interface ResourceGeneratedEvent {
  type: 'linesOfCode' | 'basicFeatures' | 'advancedFeatures' | 'premiumFeatures' | 'revenue';
  amount: number;
  source: string;
  deltaTime?: number;
}

export interface ResourceConsumedEvent {
  type: 'linesOfCode' | 'basicFeatures' | 'advancedFeatures' | 'premiumFeatures' | 'revenue';
  amount: number;
  purpose: string;
}

export interface FundsRequestEvent {
  amount: number;
  purpose: string;
  requester: string;
}

export interface FundsResponseEvent {
  success: boolean;
  error?: string;
}

// Employee Events
export interface EmployeeHiredEvent {
  department: string;
  employeeType: string;
  cost: number;
  newCount: number;
}

export interface ProductionEvent {
  department: string;
  amount: number;
  rate: number;
  deltaTime: number;
}

// Department Events
export interface DepartmentUnlockedEvent {
  department: string;
  milestone: number;
  unlockRequirement: string;
}

// UI Events
export interface ClickEvent {
  element: string;
  position: { x: number; y: number };
  timestamp: number;
}

export interface NavigationEvent {
  from: string;
  to: string;
  method: 'tap' | 'swipe' | 'programmatic';
}

// Game Events
export interface GameStateEvent {
  type: 'save' | 'load' | 'reset' | 'pause' | 'resume';
  timestamp: number;
}