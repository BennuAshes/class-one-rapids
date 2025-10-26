# Workflow Approval Mobile App

A standalone React Native mobile application for managing workflow approvals with real-time updates and push notifications.

## Features

- 📱 **Native Mobile Experience** - Built with Expo and React Native
- 🔔 **Push Notifications** - Get notified when new approvals are needed
- ⚡ **Real-time Updates** - Automatic polling for workflow status changes
- 🎨 **Material Design** - Beautiful UI with React Native Paper
- 📊 **Workflow Tracking** - Monitor all workflows and their progress
- ✅ **Quick Actions** - Approve or reject with one tap
- ⏱️ **Countdown Timers** - See time remaining for each approval
- 🔄 **Pull to Refresh** - Manual refresh capability on all screens
- 📱 **Tab Badge** - Visual indicator of pending approval count

## Tech Stack

- **Expo 54** - React Native development platform
- **React Native 0.81.4** - Mobile app framework
- **TanStack Query v5** - Data fetching and caching
- **React Native Paper v5** - Material Design components
- **React Navigation v7** - Navigation framework
- **Expo Notifications** - Push notification support
- **TypeScript** - Type-safe development

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator configured
- OR a physical device with Expo Go app installed

## Installation

1. **Navigate to the approval app directory:**
   ```bash
   cd approval-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests (recommended before first run):**
   ```bash
   npm test
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device:**
   - iOS: Press `i` or `npm run ios`
   - Android: Press `a` or `npm run android`
   - Web: Press `w` or `npm run web`
   - Physical device: Scan QR code with Expo Go app

## Configuration

### API Server Connection

The app connects to the approval server at `http://localhost:8080` by default. This is configured in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:8080"
    }
  }
}
```

**Important:** When running on a physical device or emulator, `localhost` won't work. Update the URL to your machine's IP address:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://192.168.1.100:8080"
    }
  }
}
```

### Notification Configuration

Notifications are configured in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

## Project Structure

```
approval-app/
├── src/
│   ├── api/
│   │   ├── client.ts           # HTTP client and API methods
│   │   ├── queries.ts          # TanStack Query hooks
│   │   └── types.ts            # TypeScript type definitions
│   ├── components/
│   │   ├── ApprovalCard.tsx    # Approval request card
│   │   ├── WorkflowCard.tsx    # Workflow list item
│   │   ├── StatusBadge.tsx     # Status indicator
│   │   └── EmptyState.tsx      # Empty state placeholder
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Bottom tab navigation
│   ├── screens/
│   │   ├── WorkflowsScreen.tsx       # Workflows list
│   │   ├── WorkflowDetailScreen.tsx  # Workflow details
│   │   └── ApprovalsScreen.tsx       # Pending approvals
│   ├── services/
│   │   ├── notifications.ts    # Push notification service
│   │   └── polling.ts          # Background polling service
│   └── theme/
│       └── theme.ts            # React Native Paper theme
├── App.tsx                     # Main app component
├── index.ts                    # Expo entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## Usage

### Starting the Approval Server

Before using the app, ensure the approval server is running:

```bash
# Start the API server
python3 ../scripts/workflow-approval-server.py

# Server will run on http://localhost:8080
```

### Running a Workflow

Start a workflow that requires approvals:

```bash
# Run with file-based approvals
APPROVAL_MODE=file ../scripts/feature-to-code.sh "Add user authentication"

# The workflow will wait for approvals
```

### Using the Mobile App

1. **View Workflows Tab:**
   - See all active and completed workflows
   - Tap a workflow to view details
   - Pull down to refresh

2. **Pending Approvals Tab:**
   - Shows all approvals waiting for action
   - Badge indicates number of pending approvals
   - Countdown timer shows time remaining
   - Tap "Approve" or "Reject" to respond
   - Preview shows first few lines of generated document

3. **Workflow Details:**
   - View complete workflow information
   - See all workflow steps and their status
   - View approval history
   - List generated files

4. **Notifications:**
   - Receive push notifications for new approvals
   - Tap notification to open the app
   - Badge count shows pending approvals

## API Integration

### Query Hooks

The app uses TanStack Query hooks for data fetching:

```typescript
// Workflows
const { data, isLoading, refetch } = useWorkflows();

// Single workflow
const { data: workflow } = useWorkflow(executionId);

// Pending approvals (polls every 5 seconds)
const { data: approvals } = usePendingApprovals();

// Pending count (derived)
const count = usePendingApprovalCount();
```

### Mutations

Actions are performed using mutations:

```typescript
// Approve
const approveMutation = useApproveRequest();
await approveMutation.mutateAsync(filePath);

// Reject
const rejectMutation = useRejectRequest();
await rejectMutation.mutateAsync({ filePath, reason });
```

### Polling Configuration

The app uses different polling intervals based on app state:

- **Active (foreground):** 5 seconds
- **Background:** 30 seconds
- **Pending approvals:** 5 seconds (aggressive polling)
- **Workflows:** 30 seconds

## Customization

### Change Theme

Edit `src/theme/theme.ts` to customize colors:

```typescript
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',  // Change primary color
    // ... other colors
  },
};
```

### Adjust Polling Intervals

Edit polling intervals in screens or services:

```typescript
// In WorkflowsScreen.tsx
useWorkflows({ refetchInterval: 60000 }); // 60 seconds

// In polling.ts
pollingService.start(45000); // 45 seconds
```

### Modify Status Colors

Edit `src/theme/theme.ts`:

```typescript
export const statusColors = {
  awaiting_approval: '#FF9800',  // Orange
  approved: '#4CAF50',           // Green
  rejected: '#F44336',           // Red
  // ... other statuses
};
```

## Troubleshooting

### App Can't Connect to Server

1. **Check server is running:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Update API URL for physical device/emulator:**
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update `app.json` with your IP
   - Restart Expo: `npm start`

3. **Check firewall settings:**
   - Ensure port 8080 is accessible
   - Allow Python through firewall

### Notifications Not Working

1. **Permissions not granted:**
   - Check device settings
   - Reinstall app and grant permissions

2. **Physical device required:**
   - Notifications don't work in simulators
   - Test on a real device

3. **Check notification service:**
   - Look for errors in console
   - Verify `expo-notifications` is installed

### Polling Not Working

1. **Check console for errors:**
   ```bash
   # Look for polling errors in Expo logs
   ```

2. **Verify app state changes:**
   - Background polling uses longer intervals
   - Bring app to foreground to trigger active polling

### Build Errors

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   npm start --clear
   ```

2. **Check React Native compatibility:**
   - Ensure all dependencies are compatible
   - Check for peer dependency warnings

## Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios

# Or create standalone app
expo build:ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Or create APK
expo build:android
```

## Testing

The app includes comprehensive test coverage for all components, screens, and services.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- **✅ API Layer**: Client methods, query hooks, mutations, error handling
- **✅ Components**: StatusBadge, WorkflowCard, ApprovalCard, EmptyState
- **✅ Screens**: WorkflowsScreen, ApprovalsScreen, WorkflowDetailScreen
- **✅ Services**: Notifications, polling service
- **✅ Navigation**: Bottom tab navigation with badges

For detailed testing documentation, see [TESTING.md](./TESTING.md).

### Testing Requirements

All tests verify:
- ✅ Functional requirements (list workflows, approve/reject, notifications)
- ✅ Loading and error states
- ✅ User interactions (button presses, navigation)
- ✅ Real-time updates (polling, badge counts)
- ✅ Edge cases (empty states, network errors, timeouts)

## Performance Optimization

1. **Adjust polling intervals** based on your needs
2. **Enable query caching** for better performance
3. **Use pull-to-refresh** instead of aggressive polling
4. **Implement pagination** if workflow list grows large

## Future Enhancements

- [ ] Biometric authentication (Touch ID / Face ID)
- [ ] Offline mode with sync queue
- [ ] Document preview/editing inline
- [ ] Multi-select bulk approve/reject
- [ ] Custom notification sounds
- [ ] Dark mode support
- [ ] Workflow filtering and search
- [ ] Approval history export
- [ ] Widget support (iOS/Android)

## License

This project is part of the Class One Rapids workflow system.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API server logs
3. Check Expo error messages
4. Verify network connectivity