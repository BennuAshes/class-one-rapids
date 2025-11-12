# React Native Testing Library - Implementation Guide

## 🚀 Quick Start

### Installation Commands
```bash
# Core packages
npm install --save-dev @testing-library/react-native
npm install --save-dev @testing-library/jest-native
npm install --save-dev @testing-library/user-event

# For Expo projects
npm install --save-dev jest-expo

# For mocking
npm install --save-dev msw
```

### Basic Setup
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo', // or 'react-native' for bare RN
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation)/)'
  ],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

### Minimum Requirements
- React Native 0.71+
- React 18+
- Node 18+
- Jest 29+

## 📋 Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `npm test` | Run all tests | `npm test` |
| `npm test -- --watch` | Run tests in watch mode | `npm test -- --watch` |
| `npm test -- --coverage` | Generate coverage report | `npm test -- --coverage` |
| `npm test -- --updateSnapshot` | Update snapshots | `npm test -- -u` |
| `npm test -- ComponentName` | Test specific file | `npm test -- Button.test` |

## 💻 Code Examples

### Basic Component Testing

```typescript
// Button.test.tsx
import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Component', () => {
  // Setup user event instance
  const user = userEvent.setup();

  test('renders button with text', () => {
    render(<Button title="Click me" onPress={() => {}} />);

    expect(screen.await findByText('Click me')).toBeTruthy();
  });

  test('calls onPress when pressed', async () => {
    const handlePress = jest.fn();
    render(<Button title="Click me" onPress={handlePress} />);

    await user.press(screen.await findByText('Click me'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  test('disabled button cannot be pressed', async () => {
    const handlePress = jest.fn();
    render(<Button title="Click me" onPress={handlePress} disabled />);

    const button = screen.await findByText('Click me');

    // Verify button is disabled
    expect(button).toBeDisabled();

    // Try to press - should not trigger handler
    await user.press(button);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
```

### Form Testing with Validation

```typescript
// LoginForm.test.tsx
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const user = userEvent.setup();

  test('validates email format', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    const emailInput = screen.await findByPlaceholderText('Email');
    const passwordInput = screen.await findByPlaceholderText('Password');
    const submitButton = screen.await findByText('Login');

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.press(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.await findByText('Invalid email format')).toBeTruthy();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    const emailInput = screen.await findByPlaceholderText('Email');
    const passwordInput = screen.await findByPlaceholderText('Password');
    const submitButton = screen.await findByText('Login');

    // Enter valid data
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'securepass123');
    await user.press(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'securepass123'
      });
    });
  });

  test('clears form on reset', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    const emailInput = screen.await findByPlaceholderText('Email');
    const resetButton = screen.await findByText('Reset');

    await user.type(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');

    await user.press(resetButton);
    expect(emailInput.props.value).toBe('');
  });
});
```

### FlatList Testing

```typescript
// ProductList.test.tsx
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ProductList } from './ProductList';
import { mockProducts } from './__mocks__/products';

describe('ProductList', () => {
  const user = userEvent.setup();

  test('renders list of products', () => {
    render(<ProductList products={mockProducts} />);

    // Verify first and last item are rendered
    expect(screen.await findByText(mockProducts[0].name)).toBeTruthy();
    expect(screen.await findByText(mockProducts[mockProducts.length - 1].name)).toBeTruthy();
  });

  test('shows empty state when no products', () => {
    render(<ProductList products={[]} />);

    expect(screen.await findByText('No products available')).toBeTruthy();
  });

  test('handles infinite scroll', async () => {
    const loadMore = jest.fn();
    render(
      <ProductList
        products={mockProducts}
        onEndReached={loadMore}
        testID="product-list"
      />
    );

    const list = screen.await findByTestId('product-list');

    // Scroll to bottom
    await user.scrollTo(list, {
      y: 1000,
      animated: false
    });

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalled();
    });
  });

  test('pull to refresh', async () => {
    const onRefresh = jest.fn(() => Promise.resolve());
    render(
      <ProductList
        products={mockProducts}
        onRefresh={onRefresh}
        testID="product-list"
      />
    );

    const list = screen.await findByTestId('product-list');

    // Simulate pull to refresh
    await user.scrollTo(list, {
      y: -100,
      animated: false
    });

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });
});
```

### Advanced Patterns

#### Testing with Context Providers

```typescript
// utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';

// Create a custom render that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NavigationContainer>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };
```

#### Testing Custom Hooks

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  test('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  test('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test('decrements counter', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  test('resets counter', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

#### Async Testing Patterns

```typescript
// AsyncComponent.test.tsx
import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react-native';
import { AsyncDataComponent } from './AsyncDataComponent';
import * as api from '../api';

// Mock the API module
jest.mock('../api');

describe('AsyncDataComponent', () => {
  test('shows loading state initially', () => {
    render(<AsyncDataComponent />);

    expect(screen.await findByText('Loading...')).toBeTruthy();
  });

  test('displays data after loading', async () => {
    const mockData = { name: 'Test Item', id: 1 };
    (api.fetchData as jest.Mock).mockResolvedValue(mockData);

    render(<AsyncDataComponent />);

    // Wait for loading to disappear
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    // Check data is displayed
    expect(screen.await findByText('Test Item')).toBeTruthy();
  });

  test('handles error state', async () => {
    (api.fetchData as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<AsyncDataComponent />);

    await waitFor(() => {
      expect(screen.await findByText('Error: Network error')).toBeTruthy();
    });
  });

  test('retries on failure', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockResolvedValueOnce({ name: 'Success', id: 2 });

    (api.fetchData as jest.Mock) = mockFetch;

    render(<AsyncDataComponent />);

    // Wait for error
    await waitFor(() => {
      expect(screen.await findByText('Error: First fail')).toBeTruthy();
    });

    // Press retry button
    const retryButton = screen.await findByText('Retry');
    await userEvent.press(retryButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.await findByText('Success')).toBeTruthy();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

## 🔧 Configuration

### Jest Setup File

```javascript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Setup MSW for network mocking
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Setup fake timers
global.setImmediate = jest.useRealTimers as unknown as typeof setImmediate;
```

### MSW Network Mocking

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ])
    );
  }),

  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === 'user@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({ token: 'fake-jwt-token', user: { id: 1, email } })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Environment Variables
- `NODE_ENV=test`: Set automatically by Jest
- `JEST_WORKER_ID`: Available in test environment
- Custom test env vars in `.env.test` file

## ✅ Best Practices

### DO: Use User Event Over FireEvent
```typescript
// Good - More realistic user interaction
import { userEvent } from '@testing-library/react-native';

const user = userEvent.setup();
await user.press(button);
await user.type(input, 'Hello');
await user.longPress(element, { duration: 500 });

// Bad - Low-level, less realistic
import { fireEvent } from '@testing-library/react-native';

fireEvent.press(button);
fireEvent.changeText(input, 'Hello');
```

### DO: Query Elements Like Users Would
```typescript
// Good - User-centric queries
screen.await findByText('Submit');
screen.await findByPlaceholderText('Enter email');
screen.await findByRole('button', { name: 'Save' });
screen.await findByLabelText('Username');

// Bad - Implementation details
screen.await findByTestId('submit-btn-id');
screen.await findByProps({ id: 'email-input' });
```

### DON'T: Test Implementation Details
```typescript
// Bad - Testing state directly
expect(component.state.isLoading).toBe(true);
expect(component.instance().calculateTotal()).toBe(100);

// Good - Test visible behavior
expect(screen.await findByText('Loading...')).toBeTruthy();
expect(screen.await findByText('Total: $100')).toBeTruthy();
```

### DO: Use Async Utilities Properly
```typescript
// Good - Proper async handling
await waitFor(() => {
  expect(screen.await findByText('Loaded')).toBeTruthy();
});

const element = await screen.findByText('Async Content');

await waitForElementToBeRemoved(() =>
  screen.queryByText('Loading...')
);

// Bad - Missing await or wrong usage
waitFor(() => {  // Missing await!
  expect(screen.await findByText('Loaded')).toBeTruthy();
});

await waitFor(() => {
  // Side effects shouldn't be in waitFor
  mockApi.call();
  expect(result).toBe(true);
});
```

### DO: Clean Up Between Tests
```typescript
// Good - Proper cleanup
describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Usually automatic, but good to be explicit
  });

  test('...', () => {
    // Test implementation
  });
});
```

### DO: Use Custom Render for Providers
```typescript
// Good - Consistent provider wrapping
import { render } from './test-utils'; // Custom render with providers

test('component with context', () => {
  render(<MyComponent />); // Already wrapped with providers
});

// Bad - Repeating provider setup
test('component with context', () => {
  render(
    <ThemeProvider>
      <AuthProvider>
        <MyComponent />
      </AuthProvider>
    </ThemeProvider>
  );
});
```

### DO: Use testID for Style Verification in React Native

React Native's component tree structure means you cannot access TouchableOpacity styles through child Text elements. Use `testID` for querying components when verifying styles.

```typescript
// Good - Use testID to access the TouchableOpacity directly
test('button meets accessibility touch target size', () => {
  render(
    <TouchableOpacity testID="feed-button" style={{ minWidth: 44, minHeight: 44 }}>
      <Text>Feed</Text>
    </TouchableOpacity>
  )

  const button = screen.getByTestId('feed-button')
  const style = Array.isArray(button.props.style)
    ? Object.assign({}, ...button.props.style)
    : button.props.style

  expect(style.minWidth).toBeGreaterThanOrEqual(44)
  expect(style.minHeight).toBeGreaterThanOrEqual(44)
})

// Bad - Trying to access styles through Text element's parent
test('button meets accessibility touch target size', () => {
  const { getByText } = render(
    <TouchableOpacity style={{ minWidth: 44, minHeight: 44 }}>
      <Text>Feed</Text>
    </TouchableOpacity>
  )

  const button = getByText('Feed').parent // ❌ Won't work!
  expect(button?.props.style.minWidth).toBeGreaterThanOrEqual(44) // undefined
})
```

**Reasoning**: React Native's testing library doesn't expose TouchableOpacity style properties through child element queries. Always use `testID` or `getByRole` for components you need to inspect properties on.

## 🐛 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Unable to find element with text" | Element not rendered or async timing | Use `findByText` or `waitFor` instead of `await findByText` |
| "Warning: An update to Component inside a test was not wrapped in act(...)" | Async state update | Wrap async operations in `waitFor` or use `findBy` queries |
| "Cannot read property 'navigate' of undefined" | Navigation not mocked | Mock `@react-navigation/native` in setup file |
| "Network request failed" | Unmocked API call | Set up MSW handlers or mock the API module |
| "Invariant Violation: TurboModuleRegistry.get" | Native module not mocked | Mock the native module in jest.setup.js |
| "The element is not pressable" | Element is disabled or not visible | Check element state or use `toBeDisabled()` assertion |
| "Timeout exceeded waiting for element" | Element never appears | Increase timeout or check component logic |

## 🔍 Testing Patterns

### Snapshot Testing with Accessibility
```typescript
// Component.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { axe, toHaveNoViolations } from 'jest-axe-native';
import { Component } from './Component';

expect.extend(toHaveNoViolations);

describe('Component', () => {
  test('matches snapshot', () => {
    const { toJSON } = render(<Component />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('accessibility properties', () => {
    const { await findByRole } = render(<Component />);

    const button = await findByRole('button', { name: 'Submit' });
    expect(button).toHaveAccessibilityHint('Submits the form');
    expect(button).toHaveAccessibilityState({ disabled: false });
  });
});
```

### Modal Testing
```typescript
// Modal.test.tsx
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ModalComponent } from './ModalComponent';

describe('ModalComponent', () => {
  const user = userEvent.setup();

  test('opens modal on button press', async () => {
    render(<ModalComponent />);

    // Modal should not be visible initially
    expect(screen.queryByText('Modal Content')).toBeNull();

    // Open modal
    await user.press(screen.await findByText('Open Modal'));

    // Modal should be visible
    await waitFor(() => {
      expect(screen.await findByText('Modal Content')).toBeTruthy();
    });
  });

  test('closes modal on backdrop press', async () => {
    render(<ModalComponent />);

    await user.press(screen.await findByText('Open Modal'));

    // Press backdrop (usually has a testID)
    await user.press(screen.await findByTestId('modal-backdrop'));

    await waitForElementToBeRemoved(() =>
      screen.queryByText('Modal Content')
    );
  });
});
```

### Performance Testing
```typescript
// PerformanceTest.test.tsx
import React from 'react';
import { render, screen, measurePerformance } from '@testing-library/react-native';
import { HeavyComponent } from './HeavyComponent';

describe('Performance', () => {
  test('renders within acceptable time', async () => {
    const startTime = performance.now();

    render(<HeavyComponent items={Array(1000).fill(null)} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
  });

  test('re-renders efficiently', async () => {
    const { rerender } = render(<HeavyComponent count={1} />);

    const startTime = performance.now();

    // Trigger multiple re-renders
    for (let i = 2; i <= 10; i++) {
      rerender(<HeavyComponent count={i} />);
    }

    const endTime = performance.now();
    const totalRerenderTime = endTime - startTime;

    expect(totalRerenderTime).toBeLessThan(500); // All re-renders in less than 500ms
  });
});
```

## 📚 Resources

- [Official React Native Testing Library Docs](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Main Site](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/docs/tutorial-react-native)
- [React Native Testing Examples](https://github.com/vanGalilea/react-native-testing)
- [MSW Documentation](https://mswjs.io/)
- [Testing React Navigation](https://reactnavigation.org/docs/testing/)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)

## ⚠️ Known Limitations

### Current Limitations (2024-2025)
- **fireEvent.scroll** issues with React Native 0.73+ for FlatList render window updates
- **User Event** doesn't support all gesture types yet (swipe, pinch, rotate)
- **Snapshot testing** doesn't capture native component visual appearance
- **Animations** are difficult to test reliably - usually need to be mocked
- **Native modules** require manual mocking for each module

### Version-Specific Issues
- React Native 0.73+: FlatList scroll event handling requires workarounds
- React Navigation 6+: Requires specific transformer configuration
- Expo SDK 50+: Some native modules need updated mocks

### Workarounds Available
- Use `act()` wrapper for any state updates outside of React's event system
- Mock native modules in jest.setup.js
- Use `fake timers` for testing time-dependent behavior
- Create custom test utilities for complex scenarios

---

*Generated: 2025-09-18 18:44:18*