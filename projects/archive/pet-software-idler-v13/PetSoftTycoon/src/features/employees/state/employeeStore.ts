import { observable } from '@legendapp/state';

interface Employee {
  id: string;
  name: string;
  type: 'developer' | 'designer' | 'tester' | 'manager';
  level: number;
  salary: number;
  productivity: number;
  departmentId?: string;
}

export const employeeState$ = observable({
  employees: [] as Employee[],
  
  // Computed values for employee analytics
  totalSalaries: () => {
    return employeeState$.employees.get().reduce(
      (sum, employee) => sum + employee.salary,
      0
    );
  },
  
  totalProductivity: () => {
    return employeeState$.employees.get().reduce(
      (sum, employee) => sum + employee.productivity,
      0
    );
  },
  
  employeesByDepartment: (departmentId: string) => {
    return employeeState$.employees.get().filter(
      employee => employee.departmentId === departmentId
    );
  }
});