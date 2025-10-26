# Testing Documentation

## Overview

This document describes the testing setup and coverage for the Workflow Approval Mobile App.

## Testing Stack

- **Jest** - Test runner and framework
- **React Native Testing Library** - Component testing
- **@testing-library/jest-native** - Custom matchers for React Native
- **jest-expo** - Expo-specific Jest preset

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized using the `__tests__` directory convention:

```
src/
├── api/__tests__/
│   ├── client.test.ts
│   └── queries.test.tsx
├── components/__tests__/
│   ├── StatusBadge.test.tsx
│   ├── WorkflowCard.test.tsx
│   ├── ApprovalCard.test.tsx
│   └── EmptyState.test.tsx
├── screens/__tests__/
│   ├── WorkflowsScreen.test.tsx
│   ├── ApprovalsScreen.test.tsx
│   └── WorkflowDetailScreen.test.tsx
├── services/__tests__/
│   ├── notifications.test.ts
│   └── polling.test.ts
└── navigation/__tests__/
    └── AppNavigator.test.tsx
```

## Test Coverage

### API Layer (src/api/)

#### client.test.ts
- ✅ Health check API calls
- ✅ Get all workflows
- ✅ Get single workflow by ID
- ✅ Get pending approvals
- ✅ Approve request
- ✅ Reject request with reason
- ✅ Error handling (network errors, timeouts, 404s, etc.)
- ✅ JSON parsing errors
- ✅ Request timeout handling

#### queries.test.tsx
- ✅ useHealth hook
- ✅ useWorkflows hook with polling
- ✅ useWorkflow hook for single workflow
- ✅ usePendingApprovals hook with polling
- ✅ usePendingApprovalCount derived state
- ✅ useApproveRequest mutation
- ✅ useRejectRequest mutation
- ✅ Query caching and invalidation
- ✅ Error states

### Components (src/components/)

#### StatusBadge.test.tsx
- ✅ Renders all workflow statuses correctly
- ✅ Formats status text (replaces underscores)
- ✅ Supports small and medium sizes
- ✅ Applies correct colors for each status

#### WorkflowCard.test.tsx
- ✅ Displays execution ID
- ✅ Shows status badge
- ✅ Renders start timestamp
- ✅ Shows current step when available
- ✅ Shows approval mode when available
- ✅ Handles press events
- ✅ Formats dates correctly
- ✅ Works with different statuses

#### ApprovalCard.test.tsx
- ✅ Displays checkpoint name and execution ID
- ✅ Shows preview text
- ✅ Renders countdown timer
- ✅ Calls onApprove when approve button pressed
- ✅ Calls onReject when reject button pressed
- ✅ Disables buttons when loading
- ✅ Shows/hides "Read More" for long previews
- ✅ Expands preview on "Read More" click
- ✅ Formats timestamp
- ✅ Handles expired timers
- ✅ Works without preview

#### EmptyState.test.tsx
- ✅ Renders icon, title, and message
- ✅ Works without message
- ✅ Supports different icons
- ✅ Displays elements in correct order

### Screens (src/screens/)

#### WorkflowsScreen.test.tsx
- ✅ Shows loading state initially
- ✅ Renders workflows list
- ✅ Shows empty state when no workflows
- ✅ Shows error state on fetch failure
- ✅ Navigates to detail screen on card press
- ✅ Refreshes data on pull-to-refresh
- ✅ Refresh button triggers refetch

#### ApprovalsScreen.test.tsx
- ✅ Shows loading state initially
- ✅ Renders pending approvals list
- ✅ Shows empty state when no approvals
- ✅ Shows error state on fetch failure
- ✅ Calls approve API on approve button
- ✅ Shows reject dialog on reject button
- ✅ Calls reject API on confirmation
- ✅ Closes dialog on cancel
- ✅ Handles custom reject reason

#### WorkflowDetailScreen.test.tsx
- ✅ Shows loading state initially
- ✅ Renders workflow details
- ✅ Displays workflow steps
- ✅ Shows approval history
- ✅ Lists generated files with sizes
- ✅ Shows error state on fetch failure
- ✅ Shows not found state for missing workflow

### Services (src/services/)

#### notifications.test.ts
- ✅ Requests permissions on physical device
- ✅ Returns false on simulator
- ✅ Handles already granted permissions
- ✅ Handles denied permissions
- ✅ Schedules notifications with correct content
- ✅ Sets badge count
- ✅ Clears all notifications
- ✅ Handles errors gracefully

#### polling.test.ts
- ✅ Starts polling with default interval
- ✅ Polls at specified interval
- ✅ Updates badge count on poll
- ✅ Sends notifications for new approvals
- ✅ Doesn't send notifications for existing approvals
- ✅ Stops polling when requested
- ✅ Handles polling errors gracefully
- ✅ Polls immediately on pollNow()
- ✅ Prevents duplicate polling

### Navigation (src/navigation/)

#### AppNavigator.test.tsx
- ✅ Renders bottom tab navigation
- ✅ Shows badge on Approvals tab when pending
- ✅ Hides badge when no pending approvals

## Mocking Strategy

### Global Mocks (jest.setup.js)

1. **Expo Modules**
   - expo-constants
   - expo-notifications
   - expo-device

2. **React Navigation**
   - useNavigation hook
   - useRoute hook

3. **React Native Paper**
   - Portal component

4. **React Native**
   - Animated components
   - Vector icons

5. **Global APIs**
   - fetch
   - btoa

### Test-Specific Mocks

Each test file mocks only the dependencies it needs:
- API client methods
- Query hooks
- Service functions

## Test Utilities

### Wrapper Components

Most tests use wrapper components to provide required context:

```typescript
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>{children}</PaperProvider>
    </QueryClientProvider>
  );
};
```

### Common Test Patterns

#### Testing Async Operations
```typescript
await waitFor(() => {
  expect(getByText('Expected Text')).toBeTruthy();
});
```

#### Testing User Interactions
```typescript
fireEvent.press(getByText('Button'));
expect(mockFunction).toHaveBeenCalled();
```

#### Testing Query States
```typescript
// Loading
expect(result.current.isLoading).toBe(true);

// Success
await waitFor(() => expect(result.current.isSuccess).toBe(true));
expect(result.current.data).toEqual(mockData);

// Error
await waitFor(() => expect(result.current.isError).toBe(true));
```

## Requirements Coverage

### Functional Requirements

| Requirement | Test Coverage |
|------------|---------------|
| List all workflows | ✅ WorkflowsScreen.test.tsx |
| View workflow details | ✅ WorkflowDetailScreen.test.tsx |
| Show pending approvals | ✅ ApprovalsScreen.test.tsx |
| Approve requests | ✅ ApprovalsScreen.test.tsx, queries.test.tsx |
| Reject requests | ✅ ApprovalsScreen.test.tsx, queries.test.tsx |
| Real-time updates (polling) | ✅ polling.test.ts, queries.test.tsx |
| Push notifications | ✅ notifications.test.ts |
| Badge counts | ✅ AppNavigator.test.tsx, polling.test.ts |
| Countdown timers | ✅ ApprovalCard.test.tsx |
| Pull-to-refresh | ✅ WorkflowsScreen.test.tsx |

### Non-Functional Requirements

| Requirement | Test Coverage |
|------------|---------------|
| Error handling | ✅ All screen tests, API tests |
| Loading states | ✅ All screen tests |
| Empty states | ✅ EmptyState.test.tsx, screen tests |
| Network timeouts | ✅ client.test.ts |
| Permission handling | ✅ notifications.test.ts |
| Graceful degradation | ✅ Service tests |

## Known Limitations

1. **Navigation Testing**: Limited to basic rendering and navigation calls. Full navigation flow testing would require integration tests.

2. **Timer Testing**: Uses fake timers for countdown and polling tests. Real-time behavior not tested.

3. **Platform-Specific**: Tests run in Node environment, not actual iOS/Android. Some platform-specific behaviors may not be caught.

4. **Visual Regression**: No screenshot/visual regression testing. UI appearance not validated.

5. **Accessibility**: No accessibility testing (screen reader support, contrast, etc.).

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Mocks are cleared between tests
3. **Async Handling**: Proper use of `waitFor` for async operations
4. **Descriptive Names**: Test names clearly describe what is being tested
5. **Arrange-Act-Assert**: Tests follow the AAA pattern
6. **Mock Sparingly**: Only mock external dependencies, not internal logic

## Continuous Integration

To run tests in CI/CD:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd approval-app
    npm install
    npm test -- --coverage --maxWorkers=2
```

## Debugging Tests

```bash
# Run a single test file
npm test -- StatusBadge.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render"

# Debug with Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand

# See which tests are running
npm test -- --verbose
```

## Future Improvements

- [ ] Integration tests for complete user flows
- [ ] E2E tests with Detox or Maestro
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Snapshot testing for components
- [ ] Test actual API integration (with mock server)
- [ ] Cross-platform testing (iOS/Android specific)