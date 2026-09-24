import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, fireEvent } from '@testing-library/react-native';
import { THEMATIC_CATEGORIES, ThematicCategory } from '../config/categories';
import { ThematicCategoriesSection } from '../components/ThematicCategoriesSection/ThematicCategoriesSection';
import { ThematicCategoryCard } from '../components/ThematicCategoryCard/ThematicCategoryCard';
import { LocaleProvider } from '../context/LocaleContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Thematic Categories Config & Data Integrity', () => {
  it('contains exactly 16 thematic categories with valid metadata', () => {
    expect(THEMATIC_CATEGORIES).toHaveLength(16);

    THEMATIC_CATEGORIES.forEach(cat => {
      expect(cat.id).toBeDefined();
      expect(cat.emoji).toBeDefined();
      expect(cat.iconName).toBeDefined();
      expect(cat.color).toBeDefined();
      expect(cat.gradientColors).toHaveLength(2);
      expect(cat.titleKey).toBeDefined();
      expect(cat.subtitleKey).toBeDefined();
      expect(cat.verbInfinitives.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('verifies all category verbs exist in the data/ directory', () => {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    const existingInfinitives = new Set<string>();
    files.forEach(f => {
      const card = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
      if (card.infinitive) {
        existingInfinitives.add(card.infinitive.toLowerCase().replace('sich ', '').trim());
      }
    });

    THEMATIC_CATEGORIES.forEach(category => {
      category.verbInfinitives.forEach(infinitive => {
        const clean = infinitive.toLowerCase().replace('sich ', '').trim();
        expect(existingInfinitives.has(clean)).toBe(true);
      });
    });
  });
});

describe('Thematic Categories UI Components', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <LocaleProvider>
        <ThemeProvider>{component}</ThemeProvider>
      </LocaleProvider>,
    );
  };

  it('renders ThematicCategoriesSection and all 16 category cards', () => {
    const handleSelectCategory = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ThematicCategoriesSection onSelectCategory={handleSelectCategory} />,
    );

    expect(getByTestId('thematic-categories-section')).toBeTruthy();

    THEMATIC_CATEGORIES.forEach(cat => {
      expect(getByTestId(`thematic-category-card-${cat.id}`)).toBeTruthy();
    });
  });

  it('fires onSelectCategory callback when category card is clicked', () => {
    const handleSelectCategory = jest.fn();
    const category: ThematicCategory = THEMATIC_CATEGORIES[0];

    const { getByTestId } = renderWithProviders(
      <ThematicCategoryCard category={category} onPress={handleSelectCategory} />,
    );

    const card = getByTestId(`thematic-category-card-${category.id}`);
    fireEvent.press(card);

    expect(handleSelectCategory).toHaveBeenCalledTimes(1);
  });
});
