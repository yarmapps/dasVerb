import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PracticeCheckpointCard } from '../components/PracticeCheckpointCard/PracticeCheckpointCard';
import { ThemeProvider } from '../context/ThemeContext';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('PracticeCheckpointCard', () => {
  it('renders intermediary uncompleted checkpoint card correctly', () => {
    const handlePress = jest.fn();
    const { getByText, getByTestId } = render(
      <Wrapper>
        <PracticeCheckpointCard
          title="Checkpoint 1"
          subtitle="Verbs 1 – 10"
          status="uncompleted"
          isFinal={false}
          onPress={handlePress}
          testID="cp-card"
        />
      </Wrapper>,
    );

    expect(getByText('Checkpoint 1')).toBeTruthy();
    expect(getByText('Verbs 1 – 10')).toBeTruthy();

    fireEvent.press(getByTestId('cp-card'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('renders final test card with flag-checkered icon styling', () => {
    const handlePress = jest.fn();
    const { getByText } = render(
      <Wrapper>
        <PracticeCheckpointCard
          title="Final Test A1"
          subtitle="Comprehensive 20-question test"
          status="uncompleted"
          isFinal={true}
          onPress={handlePress}
        />
      </Wrapper>,
    );

    expect(getByText('Final Test A1')).toBeTruthy();
    expect(getByText('Comprehensive 20-question test')).toBeTruthy();
  });

  it('renders trophy, silver, and bronze statuses', () => {
    const { rerender, queryByText } = render(
      <Wrapper>
        <PracticeCheckpointCard
          title="Checkpoint A1"
          status="trophy"
          isFinal={true}
          onPress={jest.fn()}
        />
      </Wrapper>,
    );
    expect(queryByText('Checkpoint A1')).toBeTruthy();

    rerender(
      <Wrapper>
        <PracticeCheckpointCard
          title="Checkpoint A1"
          status="silver"
          isFinal={true}
          onPress={jest.fn()}
        />
      </Wrapper>,
    );
    expect(queryByText('Checkpoint A1')).toBeTruthy();

    rerender(
      <Wrapper>
        <PracticeCheckpointCard
          title="Checkpoint A1"
          status="bronze"
          isFinal={true}
          onPress={jest.fn()}
        />
      </Wrapper>,
    );
    expect(queryByText('Checkpoint A1')).toBeTruthy();
  });
});
