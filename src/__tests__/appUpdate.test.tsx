import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, AppState } from 'react-native';
import { LocaleProvider } from '../context/LocaleContext';
import { ThemeProvider } from '../context/ThemeContext';
import * as Application from 'expo-application';
import { AppUpdateModal } from '../components/AppUpdateModal/AppUpdateModal';

const mockAppConfig = {
  ios: {
    minimum_version: '1.0.0',
    latest_version: '1.2.0',
    update_url: 'https://apps.apple.com/app/id123456789',
  },
  android: {
    minimum_version: '1.0.0',
    latest_version: '1.2.0',
    update_url: 'https://play.google.com/store/apps/details?id=com.yarm.apps.dasverb',
  },
  features: {
    free_daily_quizzes: 3,
  },
};

jest.mock('../services/appConfigService', () => ({
  fetchRemoteConfig: jest.fn(() => Promise.resolve(mockAppConfig)),
  getAppConfig: jest.fn(() => mockAppConfig),
}));

describe('AppUpdateModal & useAppUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
  });

  const renderModal = () =>
    render(
      <LocaleProvider>
        <ThemeProvider>
          <AppUpdateModal />
        </ThemeProvider>
      </LocaleProvider>,
    );

  it('should render soft update modal with close button when version is between minimum and latest', async () => {
    Object.defineProperty(Application, 'nativeApplicationVersion', {
      value: '1.1.0',
      configurable: true,
    });

    const { getByTestId, queryByTestId } = renderModal();

    await waitFor(() => {
      expect(getByTestId('app-update-modal')).toBeTruthy();
    });

    expect(getByTestId('app-update-close-button')).toBeTruthy();
    expect(getByTestId('app-update-now-button')).toBeTruthy();

    fireEvent.press(getByTestId('app-update-now-button'));
    expect(Linking.openURL).toHaveBeenCalled();

    fireEvent.press(getByTestId('app-update-close-button'));
    expect(queryByTestId('app-update-modal')).toBeNull();
  });

  it('should render force update modal without close button when version is below minimum_version', async () => {
    Object.defineProperty(Application, 'nativeApplicationVersion', {
      value: '0.9.0',
      configurable: true,
    });

    const { getByTestId, queryByTestId } = renderModal();

    await waitFor(() => {
      expect(getByTestId('app-update-modal')).toBeTruthy();
    });

    expect(queryByTestId('app-update-close-button')).toBeNull();
    expect(getByTestId('app-update-now-button')).toBeTruthy();

    fireEvent.press(getByTestId('app-update-now-button'));
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('should render nothing when current version is equal to or greater than latest_version', async () => {
    Object.defineProperty(Application, 'nativeApplicationVersion', {
      value: '1.2.0',
      configurable: true,
    });

    const { queryByTestId } = renderModal();

    await waitFor(() => {
      expect(queryByTestId('app-update-modal')).toBeNull();
    });
  });

  it('should re-check for update when AppState changes to active', async () => {
    const { fetchRemoteConfig } = jest.requireMock('../services/appConfigService');
    renderModal();

    // Trigger AppState change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AppState as any).emit?.('change', 'active');

    expect(fetchRemoteConfig).toHaveBeenCalled();
  });
});
