/**
 * Type definitions for analytics tracking events and user properties.
 */

export type AnalyticsScreenName =
  | 'MainTabs'
  | 'Dictionary'
  | 'PracticeList'
  | 'Practice'
  | 'VerbQuiz'
  | 'QuizResults'
  | 'Settings'
  | 'LanguageSelector'
  | (string & {});

// ==========================================
// 1. DICTIONARY EVENTS (prefix: dictionary_)
// ==========================================

export interface DictionarySearchParams {
  search_term: string;
  query_length: number;
  results_count: number;
}

export interface DictionarySearchNoResultsParams {
  search_term: string;
  query_length: number;
}

export interface DictionaryVerbExpandedParams {
  infinitive: string;
  level: string;
}

export interface DictionaryVerbCollapsedParams {
  infinitive: string;
}

// ==========================================
// 2. QUIZ EVENTS (prefix: quiz_)
// ==========================================

export interface QuizStartedParams {
  quiz_type:
    | 'verb'
    | 'checkpoint'
    | 'smart'
    | 'category'
    | 'prefix'
    | 'conjugation'
    | 'verb_forms'
    | 'prepositions';
  infinitive?: string;
  level?: string;
  total_questions: number;
}

export interface QuizCompletedParams {
  quiz_type:
    | 'verb'
    | 'checkpoint'
    | 'smart'
    | 'category'
    | 'prefix'
    | 'conjugation'
    | 'verb_forms'
    | 'prepositions';
  infinitive?: string;
  level?: string;
  score: number;
  total_questions: number;
  percentage: number;
  is_passed: boolean;
  duration_seconds?: number;
}

export interface QuizInterruptedParams {
  quiz_type:
    | 'verb'
    | 'checkpoint'
    | 'smart'
    | 'category'
    | 'prefix'
    | 'conjugation'
    | 'verb_forms'
    | 'prepositions';
  infinitive?: string;
  questions_answered: number;
  total_questions: number;
}

// ==========================================
// 3. DAILY LIMIT EVENTS (prefix: daily_limit_)
// ==========================================

export interface DailyLimitShownParams {
  completed_today: number;
  free_limit: number;
}

export interface DailyLimitAdDeclinedParams {
  reason: 'close_button' | 'backdrop' | 'wait_button';
}

// ==========================================
// 4. OFFLINE LIMIT EVENTS (prefix: offline_limit_)
// ==========================================

export interface OfflineLimitCloseParams {
  reason: 'close_button' | 'backdrop';
}

export interface OfflineLimitPremiumParams {
  has_trial: boolean;
}

export interface PremiumLimitPurchaseSuccessParams {
  type: 'daily_quiz_limit' | 'offline_limit';
}

// ==========================================
// 5. AD REWARD EVENTS (prefix: ad_reward_)
// ==========================================

export interface AdRewardViewedParams {
  placement: string;
  ad_unit_id?: string;
}

export interface AdRewardEarnedParams {
  placement: string;
  grant_number_today: number;
}

// ==========================================
// 5. SETTINGS EVENTS (prefix: settings_)
// ==========================================

export interface SettingsSoundToggledParams {
  enabled: boolean;
}

export interface SettingsNotificationsToggledParams {
  enabled: boolean;
}

export interface SettingsSpeakOnCorrectToggledParams {
  enabled: boolean;
}

export interface SettingsVoiceGenderChangedParams {
  gender: 'female' | 'male';
}

export interface SettingsThemeChangedParams {
  theme: 'light' | 'dark' | 'system';
}

export interface SettingsLanguageSelectedParams {
  new_language: string;
  previous_language?: string;
}

// ==========================================
// EVENT MAP
// ==========================================

export interface AnalyticsEventMap {
  // Dictionary
  dictionary_search: DictionarySearchParams;
  dictionary_search_no_results: DictionarySearchNoResultsParams;
  dictionary_search_cleared: Record<string, never>;
  dictionary_verb_expanded: DictionaryVerbExpandedParams;
  dictionary_verb_collapsed: DictionaryVerbCollapsedParams;

  // Quiz
  quiz_started: QuizStartedParams;
  quiz_completed: QuizCompletedParams;
  quiz_interrupted: QuizInterruptedParams;

  // Daily Limit
  daily_limit_shown: DailyLimitShownParams;
  daily_limit_ad_chosen: Record<string, never>;
  daily_limit_ad_declined: DailyLimitAdDeclinedParams;
  daily_limit_premium_clicked: Record<string, never>;

  // Offline Limit
  offline_limit_modal_shown: Record<string, never>;
  offline_limit_modal_close_clicked: OfflineLimitCloseParams;
  offline_limit_modal_premium_clicked: OfflineLimitPremiumParams;
  premium_limit_modal_purchase_success: PremiumLimitPurchaseSuccessParams;

  // Ad Reward
  ad_reward_viewed: AdRewardViewedParams;
  ad_reward_earned: AdRewardEarnedParams;

  // Settings
  settings_sound_toggled: SettingsSoundToggledParams;
  settings_notifications_toggled: SettingsNotificationsToggledParams;
  settings_speak_on_correct_toggled: SettingsSpeakOnCorrectToggledParams;
  settings_voice_gender_changed: SettingsVoiceGenderChangedParams;
  settings_theme_changed: SettingsThemeChangedParams;
  settings_language_selected: SettingsLanguageSelectedParams;
  settings_rate_app_clicked: Record<string, never>;
  settings_contact_us_clicked: Record<string, never>;
  settings_privacy_policy_clicked: Record<string, never>;
  settings_terms_of_service_clicked: Record<string, never>;
  settings_manage_subscription_clicked: Record<string, never>;
  settings_progress_reset: Record<string, never>;
  settings_all_reset: Record<string, never>;

  // Rating & Review
  rating_popup_shown: Record<string, never>;

  // First Open Paywall
  first_open_paywall_shown: Record<string, never>;
  first_open_paywall_close_clicked: Record<string, never>;
  first_open_paywall_limited_clicked: Record<string, never>;
  first_open_paywall_buy_clicked: Record<string, never>;
  first_open_paywall_purchase_complete: Record<string, never>;
  first_open_paywall_restore_clicked: Record<string, never>;
  first_open_paywall_restore_complete: Record<string, never>;

  // Premium Subscriptions
  premium_sheet_shown: Record<string, never>;
  premium_purchase_success: Record<string, never>;
  premium_restore_success: Record<string, never>;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export interface AnalyticsUserProperties {
  app_language?: string;
  selected_level?: string;
  completed_verbs_count?: string;
  current_streak_days?: string;
  is_premium?: 'true' | 'false';
  audio_enabled?: 'true' | 'false';
  [key: string]: string | undefined;
}
