import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { FireIcon } from '../components/FireIcon/FireIcon';
import { StreakBadge } from '../components/StreakBadge/StreakBadge';
import { SnowflakeIcon } from '../components/SnowflakeIcon/SnowflakeIcon';
import { useStreak } from '../hooks/useStreak';
import { ThemeProvider } from '../context/ThemeContext';
import { getMessages } from '../services/intlService';
import {
  resetStreakData,
  recordStreakActivity,
  freezeStreakToday,
  setStreakState,
} from '../services/streakService';
import { soundService } from '../services/soundService';

import { NavigationContext, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const mockNavigate = jest.fn();
const mockNavigationValue = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: () => true,
  addListener: () => () => {},
};

const messages = getMessages('ru');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationContext.Provider
    value={mockNavigationValue as unknown as NavigationProp<RootStackParamList>}
  >
    <ThemeProvider>
      <IntlProvider locale="ru" messages={messages}>
        {children}
      </IntlProvider>
    </ThemeProvider>
  </NavigationContext.Provider>
);

describe('Streak Components & Hooks', () => {
  beforeEach(() => {
    resetStreakData();
    jest.clearAllMocks();
  });

  describe('FireIcon', () => {
    it('renders active gradient flame by default', () => {
      const { getByTestId } = render(<FireIcon size={20} isActive={true} />);
      expect(getByTestId('fire-icon-active')).toBeTruthy();
    });

    it('renders inactive flame when isActive is false', () => {
      const { getByTestId } = render(
        <FireIcon size={20} isActive={false} inactiveColor="#999999" />,
      );
      expect(getByTestId('fire-icon-inactive')).toBeTruthy();
    });
  });

  describe('SnowflakeIcon', () => {
    it('renders snowflake icon properly', () => {
      const { toJSON } = render(<SnowflakeIcon size={20} isActive={true} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('StreakBadge', () => {
    it('renders current streak count and responds to press with custom callback', () => {
      const handlePress = jest.fn();
      const playTapSoundSpy = jest
        .spyOn(soundService, 'playTapSound')
        .mockImplementation(() => Promise.resolve());

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <StreakBadge onPress={handlePress} />
        </TestWrapper>,
      );

      expect(getByTestId('streak-badge')).toBeTruthy();
      expect(getByText('0')).toBeTruthy();

      fireEvent.press(getByTestId('streak-badge'));
      expect(playTapSoundSpy).toHaveBeenCalledTimes(1);
      expect(handlePress).toHaveBeenCalledTimes(1);

      playTapSoundSpy.mockRestore();
    });

    it('navigates to DailyStreak when tapped without custom onPress', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <StreakBadge />
        </TestWrapper>,
      );

      fireEvent.press(getByTestId('streak-badge'));
      expect(mockNavigate).toHaveBeenCalledWith('DailyStreak');
    });

    it('renders with animation enabled without error', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <StreakBadge animate={true} />
        </TestWrapper>,
      );
      expect(getByTestId('streak-badge')).toBeTruthy();
    });

    it('renders frozen state when streak is frozen today', () => {
      setStreakState({
        currentStreak: 3,
        bestStreak: 3,
        lastActiveDate: '2026-03-20',
        frozenDate: '2026-03-21',
      });
      freezeStreakToday();

      const { getByTestId } = render(
        <TestWrapper>
          <StreakBadge />
        </TestWrapper>,
      );
      expect(getByTestId('streak-badge')).toBeTruthy();
    });
  });

  describe('useStreak hook', () => {
    it('reactively updates when streak activity is recorded', () => {
      const { result } = renderHook(() => useStreak());
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.isActiveToday).toBe(false);

      act(() => {
        recordStreakActivity();
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.isActiveToday).toBe(true);
      expect(result.current.totalActiveDays).toBeGreaterThanOrEqual(1);
    });

    it('reactively updates when streak is frozen', () => {
      const { result } = renderHook(() => useStreak());
      act(() => {
        freezeStreakToday();
      });

      expect(result.current.isFrozenToday).toBe(true);
    });
  });
});
