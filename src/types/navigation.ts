import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Practice: undefined;
  Dictionary: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  LanguageSelector: { isSettingsMode?: boolean } | undefined;
  Settings: undefined;
  VerbsPracticeList: undefined;
};
