import { observable } from '@legendapp/state';

interface Department {
  id: string;
  name: string;
  level: number;
  employees: string[];
  productivity: number;
  revenue: number;
}

export const departmentState$ = observable({
  departments: {} as Record<string, Department>,
  
  // Computed values for department analytics
  totalRevenue: () => {
    return Object.values(departmentState$.departments.get()).reduce(
      (sum, dept) => sum + dept.revenue, 
      0
    );
  },
  
  totalEmployees: () => {
    return Object.values(departmentState$.departments.get()).reduce(
      (sum, dept) => sum + dept.employees.length,
      0
    );
  }
});