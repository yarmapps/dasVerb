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
    const handleChangeInputMode = jest.fn();
    const handleRequirePremium = jest.fn();

    const { getByText } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onChangeVoiceGender={handleToggleVoice}
          quizInputMode="choice"
          isPremium={true}
          onChangeInputMode={handleChangeInputMode}
          onRequirePremium={handleRequirePremium}
        />
      </TestWrapper>,
    );

    expect(getByText('Настройки теста')).toBeTruthy();
    expect(getByText('Произношение правильного ответа')).toBeTruthy();
    expect(getByText('Голос')).toBeTruthy();
    expect(getByText('Женский')).toBeTruthy();
    expect(getByText('Мужской')).toBeTruthy();
    expect(getByText('Режим ответов')).toBeTruthy();
    expect(getByText('Выбор вариантов')).toBeTruthy();
    expect(getByText('Ручной ввод')).toBeTruthy();
  });

  it('should trigger onToggleSpeakOnCorrectAnswer on switch toggle', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();
    const handleToggleVoice = jest.fn();
    const handleChangeInputMode = jest.fn();
    const handleRequirePremium = jest.fn();

    const { getByTestId } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onChangeVoiceGender={handleToggleVoice}
          quizInputMode="choice"
          isPremium={true}
          onChangeInputMode={handleChangeInputMode}
          onRequirePremium={handleRequirePremium}
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

  it('should trigger onChangeVoiceGender when voice segment button is pressed', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();
    const handleToggleVoice = jest.fn();
    const handleChangeInputMode = jest.fn();
    const handleRequirePremium = jest.fn();

    const { getByTestId } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onChangeVoiceGender={handleToggleVoice}
          quizInputMode="choice"
          isPremium={true}
          onChangeInputMode={handleChangeInputMode}
          onRequirePremium={handleRequirePremium}
        />
      </TestWrapper>,
    );

    const maleBtn = getByTestId('voice-gender-male-btn');
    fireEvent.press(maleBtn);
    expect(handleToggleVoice).toHaveBeenCalledWith('male');
  });

  it('should trigger onChangeInputMode when premium user selects type_in', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();
    const handleToggleVoice = jest.fn();
    const handleChangeInputMode = jest.fn();
    const handleRequirePremium = jest.fn();

    const { getByTestId } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onChangeVoiceGender={handleToggleVoice}
          quizInputMode="choice"
          isPremium={true}
          onChangeInputMode={handleChangeInputMode}
          onRequirePremium={handleRequirePremium}
        />
      </TestWrapper>,
    );

    const typeInBtn = getByTestId('quiz-input-mode-type-in-btn');
    fireEvent.press(typeInBtn);
    expect(handleChangeInputMode).toHaveBeenCalledWith('type_in');
    expect(handleRequirePremium).not.toHaveBeenCalled();
  });

  it('should call onRequirePremium when free user attempts to select type_in', () => {
    const handleClose = jest.fn();
    const handleToggleSpeak = jest.fn();
    const handleToggleVoice = jest.fn();
    const handleChangeInputMode = jest.fn();
    const handleRequirePremium = jest.fn();

    const { getByTestId } = render(
      <TestWrapper>
        <QuizSettingsModal
          visible={true}
          onClose={handleClose}
          speakOnCorrectAnswer={true}
          onToggleSpeakOnCorrectAnswer={handleToggleSpeak}
          ttsVoiceGender="female"
          onChangeVoiceGender={handleToggleVoice}
          quizInputMode="choice"
          isPremium={false}
          onChangeInputMode={handleChangeInputMode}
          onRequirePremium={handleRequirePremium}
        />
      </TestWrapper>,
    );

    const typeInBtn = getByTestId('quiz-input-mode-type-in-btn');
    fireEvent.press(typeInBtn);
    expect(handleClose).toHaveBeenCalled();
    expect(handleRequirePremium).toHaveBeenCalled();
    expect(handleChangeInputMode).not.toHaveBeenCalled();
  });
});
