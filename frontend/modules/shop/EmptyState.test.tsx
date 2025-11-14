import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  test('displays default message', () => {
    render(<EmptyState />)

    expect(screen.getByText(/upgrades coming soon/i)).toBeTruthy()
  })

  test('displays custom message when provided', () => {
    render(<EmptyState message="No upgrades available" />)

    expect(screen.getByText(/no upgrades available/i)).toBeTruthy()
  })

  test('displays hint text', () => {
    render(<EmptyState />)

    expect(screen.getByText(/check back later/i)).toBeTruthy()
  })
})
