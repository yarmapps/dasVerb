import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PracticeVerbCard } from '../components/PracticeVerbCard/PracticeVerbCard';
import { ThemeProvider } from '../context/ThemeContext';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('PracticeVerbCard', () => {
  it('renders uncompleted verb card with index, infinitive and translation', () => {
    const handlePress = jest.fn();
    const { getByText, getByTestId } = render(
      <Wrapper>
        <PracticeVerbCard
          infinitive="arbeiten"
          translation="to work"
          level="A1"
          globalIndex={5}
          status="uncompleted"
          onPress={handlePress}
          testID="verb-card-arbeiten"
        />
      </Wrapper>,
    );

    expect(getByText('arbeiten')).toBeTruthy();
    expect(getByText('to work')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();

    fireEvent.press(getByTestId('verb-card-arbeiten'));
    expect(handlePress).toHaveBeenCalledWith('arbeiten', 'A1');
  });

  it('renders trophy, silver and bronze badges without text index', () => {
    const { rerender, queryByText, getByText } = render(
      <Wrapper>
        <PracticeVerbCard
          infinitive="sprechen"
          translation="to speak"
          level="A1"
          globalIndex={12}
          status="trophy"
          onPress={jest.fn()}
        />
      </Wrapper>,
    );

    expect(getByText('sprechen')).toBeTruthy();
    // Index number should NOT be rendered when trophy is awarded
    expect(queryByText('12')).toBeNull();

    rerender(
      <Wrapper>
        <PracticeVerbCard
          infinitive="sprechen"
          translation="to speak"
          level="A1"
          globalIndex={12}
          status="silver"
          onPress={jest.fn()}
        />
      </Wrapper>,
    );
    expect(queryByText('12')).toBeNull();

    rerender(
      <Wrapper>
        <PracticeVerbCard
          infinitive="sprechen"
          translation="to speak"
          level="A1"
          globalIndex={12}
          status="bronze"
          onPress={jest.fn()}
        />
      </Wrapper>,
    );
    expect(queryByText('12')).toBeNull();
  });

  it('renders lock icon when isLocked is true and hides index number', () => {
    const handlePress = jest.fn();
    const { getByText, queryByText, getByTestId } = render(
      <Wrapper>
        <PracticeVerbCard
          infinitive="verstehen"
          translation="to understand"
          level="A2"
          globalIndex={1}
          status="uncompleted"
          isLocked={true}
          onPress={handlePress}
          testID="verb-card-verstehen"
        />
      </Wrapper>,
    );

    expect(getByText('verstehen')).toBeTruthy();
    expect(queryByText('1')).toBeNull();

    fireEvent.press(getByTestId('verb-card-verstehen'));
    expect(handlePress).toHaveBeenCalledWith('verstehen', 'A2');
  });
});
