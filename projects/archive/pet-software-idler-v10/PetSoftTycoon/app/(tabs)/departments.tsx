import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { departmentStore } from '@features/departments/state/departmentStore'
import { Department } from '@features/departments/types/department.types'

export default observer(function DepartmentsScreen() {
  const departments = departmentStore.departments.get()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Departments</Text>
      {departments.map((dept: Department) => (
        <Text key={dept.id} style={styles.department}>
          {dept.name} - {dept.unlocked ? 'Unlocked' : 'Locked'}
        </Text>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  department: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5
  }
})