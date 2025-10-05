import { TimeTrackerService } from './timeTrackerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

describe('TimeTrackerService', () => {
  let service: TimeTrackerService;
  let mockOnResume: jest.Mock;

  beforeEach(() => {
    service = new TimeTrackerService();
    mockOnResume = jest.fn();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('calculates time away correctly', async () => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(fiveMinutesAgo.toString());

    const minutesAway = await service.calculateTimeAway();

    expect(minutesAway).toBe(5);
  });

  test('returns 0 when no saved time', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const minutesAway = await service.calculateTimeAway();

    expect(minutesAway).toBe(0);
  });

  test('saves timestamp when going to background', async () => {
    const mockNow = 1234567890;
    jest.spyOn(Date, 'now').mockReturnValue(mockNow);

    await service.saveTimestamp();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@last_close_time', mockNow.toString());
  });

  test('starts tracking and sets up AppState listener', () => {
    service.startTracking(mockOnResume);

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  test('stops tracking and removes listener', () => {
    const mockRemove = jest.fn();
    (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });

    service.startTracking(mockOnResume);
    service.stopTracking();

    expect(mockRemove).toHaveBeenCalled();
  });
});