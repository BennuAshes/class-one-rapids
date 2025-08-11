import { observable } from '@legendapp/state'
import { DepartmentState, DepartmentType, Employee } from '../types/department.types'
import { subscribe, emit } from '@shared/utils/eventBus'

export const departmentStore = observable<DepartmentState>({
  departments: [
    {
      id: 'development',
      name: 'Development',
      unlocked: true, // Available at start
      employees: [],
      production: {
        baseRate: 0,
        efficiency: 1.0,
        automation: 1.0,
        resourceType: 'code'
      }
    }
  ],
  selectedDepartment: 'development',
  unlockThresholds: {
    development: 0,
    sales: 500,
    marketing: 50000,
    product: 500000,
    design: 5000000,
    qa: 50000000,
    customer_exp: 500000000
  },
  production: {
    codePerSecond: 0,
    leadsPerSecond: 0, 
    brandPerSecond: 0
  }
})

// Subscribe to revenue events for unlocking departments
subscribe('revenue_earned', (event) => {
  if (event.type === 'revenue_earned') {
    checkDepartmentUnlocks(event.amount)
  }
})

function checkDepartmentUnlocks(totalRevenue: number): void {
  const thresholds = departmentStore.unlockThresholds.get()
  const departments = departmentStore.departments.get()
  
  Object.entries(thresholds).forEach(([deptType, threshold]) => {
    const department = departments.find(d => d.id === deptType)
    if (department && !department.unlocked && totalRevenue >= threshold) {
      department.unlocked = true
      emit({ type: 'department_unlocked', department: deptType })
    }
  })
}

export const departmentActions = {
  hireDeveloper: (type: Employee['type']) => {
    // Implementation will be added in Phase 2
  },
  
  selectDepartment: (departmentId: DepartmentType) => {
    departmentStore.selectedDepartment.set(departmentId)
  }
}