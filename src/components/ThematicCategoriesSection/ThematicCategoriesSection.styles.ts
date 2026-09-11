import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';

export interface ThematicCategoriesSectionStyles {
  container: ViewStyle;
  categoriesGrid: ViewStyle;
}

export function createStyles(_colors: ThemeColors): ThematicCategoriesSectionStyles {
  return StyleSheet.create<ThematicCategoriesSectionStyles>({
    container: {
      marginTop: 0,
      marginBottom: 0,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
  });
}
