export interface Employee {
  id: string
  type: 'junior' | 'mid' | 'senior' | 'lead'
  baseProduction: number
  cost: number
  hiredAt: number
}

export interface Department {
  id: DepartmentType
  name: string
  unlocked: boolean
  employees: Employee[]
  production: {
    baseRate: number
    efficiency: number
    automation: number
    resourceType: ResourceType
  }
}

export type DepartmentType = 
  | 'development'
  | 'sales' 
  | 'marketing'
  | 'product'
  | 'design'
  | 'qa'
  | 'customer_exp'

export type ResourceType = 'code' | 'leads' | 'brand' | 'features' | 'polish'

export interface DepartmentState {
  departments: Department[]
  selectedDepartment: DepartmentType | null
  unlockThresholds: Record<DepartmentType, number>
  production: {
    codePerSecond: number
    leadsPerSecond: number
    brandPerSecond: number
  }
}