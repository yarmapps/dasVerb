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
    const handleToggleVoice = jest.fn();

    const { getByText } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onToggleTtsVoiceGender={handleToggleVoice}
        />
      </TestWrapper>,
    );

    expect(getByText('Настройки теста')).toBeTruthy();
    expect(getByText('Произношение правильного ответа')).toBeTruthy();
    expect(getByText('Голос')).toBeTruthy();
    expect(getByText('Женский')).toBeTruthy();
  });

  it('should trigger onToggleTtsVoiceGender on voice row press', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();
    const handleToggleVoice = jest.fn();

    const { getByText } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onToggleTtsVoiceGender={handleToggleVoice}
        />
      </TestWrapper>,
    );

    fireEvent.press(getByText('Голос'));
    expect(handleToggleVoice).toHaveBeenCalled();
  });
});
