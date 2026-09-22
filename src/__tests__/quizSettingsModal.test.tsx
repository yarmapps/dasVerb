import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { QuizSettingsModal } from '../components/QuizSettingsModal/QuizSettingsModal';
import { ThemeProvider } from '../context/ThemeContext';
import { getMessages } from '../services/intlService';

const messages = getMessages('ru');

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <IntlProvider locale="ru" messages={messages}>
        {children}
      </IntlProvider>
    </ThemeProvider>
  );
}

describe('QuizSettingsModal', () => {
  it('should render modal content when visible is true', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();

    const { getByText } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
        />
      </TestWrapper>,
    );

    expect(getByText('Настройки теста')).toBeTruthy();
    expect(getByText('Произношение правильного ответа')).toBeTruthy();
  });

  it('should trigger onToggleSpeakOnCorrectAnswer on switch toggle', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();

    const { getByTestId } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
        />
      </TestWrapper>,
    );

    const switchComponent = getByTestId('speak-switch');
    fireEvent(switchComponent, 'valueChange', false);
    expect(handleToggleSpeak).toHaveBeenCalledWith(false);

    const closeBtn = getByTestId('quiz-settings-close-btn');
    fireEvent.press(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
