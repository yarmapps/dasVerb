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
// 6. PAYWALL & MONETIZATION EVENTS
// ==========================================

export interface PaywallSheetShownParams {
  source?: string;
  has_trial?: boolean;
}

export interface PaywallPlanSelectedParams {
  plan_id: string;
  price: string;
  has_free_trial: boolean;
}

export interface PaywallPurchaseStartedParams {
  plan_id: string;
  source?: string;
}

export interface PaywallPurchaseSuccessParams {
  plan_id: string;
  source?: string;
}

export interface PaywallPurchaseFailedParams {
  plan_id: string;
  source?: string;
  error_message?: string;
}

export interface PaywallPurchaseCancelledParams {
  plan_id: string;
  source?: string;
}

export interface PaywallRestoreClickedParams {
  source?: string;
}

export interface PaywallRestoreSuccessParams {
  source?: string;
}

export interface PaywallRestoreEmptyParams {
  source?: string;
}

export interface PaywallSheetDismissedParams {
  source?: string;
  time_spent_seconds: number;
}

export interface LockedItemClickedParams {
  item_type: 'verb' | 'checkpoint' | 'category_verb' | 'category_final';
  level?: string;
  item_id?: string;
  source_screen: string;
}

// ==========================================
// 7. NAVIGATION & MODES EVENTS
// ==========================================

export interface PracticeModeSelectedParams {
  mode:
    | 'standard_course'
    | 'smart_quiz'
    | 'prefixes'
    | 'conjugation'
    | 'verb_forms'
    | 'prepositions';
}

export interface CategorySelectedParams {
  category_id: string;
  category_title: string;
}

export interface CefrTabSwitchedParams {
  tab: string;
  previous_tab: string;
  mode: string;
}

// ==========================================
// 8. QUIZ MICRO-BEHAVIOR EVENTS
// ==========================================

export interface QuizQuestionAnsweredParams {
  quiz_type: string;
  infinitive?: string;
  level?: string;
  question_index: number;
  is_correct: boolean;
  response_time_ms?: number;
}

export interface QuizHintViewedParams {
  quiz_type?: string;
  hint_type?:
    | 'grammar'
    | 'conjugation'
    | 'principal_parts'
    | 'auxiliary'
    | 'prefix'
    | 'verb_forms'
    | 'preposition';
  rule_type?: 'prefix' | 'conjugation' | 'verb_forms' | string;
  infinitive?: string;
  level?: string;
}

export interface QuizTtsPlayedParams {
  quiz_type?: string;
  infinitive?: string;
  level?: string;
  trigger_type: 'auto' | 'manual';
}

export interface QuizSettingsToggledInQuizParams {
  setting_name?: string;
  setting?: 'speak_on_correct' | string;
  enabled: boolean;
  quiz_type?: string;
}

// ==========================================
// 9. QUIZ RESULTS EVENTS
// ==========================================

export interface QuizResultsViewedParams {
  quiz_type: string;
  infinitive?: string;
  level?: string;
  score: number;
  total_questions: number;
  percentage: number;
  is_passed: boolean;
  has_errors: boolean;
  is_new_streak_day?: boolean;
}

export interface QuizResultsActionParams {
  action:
    | 'next_quiz'
    | 'retry'
    | 'retry_quiz'
    | 'back_to_list'
    | 'back_to_home'
    | 'toggle_show_all';
  quiz_type?: string;
  infinitive?: string;
  level?: string;
  is_passed?: boolean;
}

// ==========================================
// 10. DICTIONARY AUDIO & ADS EVENTS
// ==========================================

export interface DictionaryAudioPlayedParams {
  infinitive: string;
  level?: string;
}

export interface AdImpressionParams {
  ad_type?: 'rewarded' | 'interstitial' | 'native_practice' | 'native_dictionary';
  ad_format?: 'rewarded' | 'interstitial' | 'native_practice' | 'native_dictionary';
  ad_unit_id?: string;
}

export interface AdFallbackUsedParams {
  original_type?: string;
  fallback_type?: string;
  reason?: string;
}

export interface AdNoFillParams {
  ad_format?: string;
  reason?: string;
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
  dictionary_audio_played: DictionaryAudioPlayedParams;

  // Quiz
  quiz_started: QuizStartedParams;
  quiz_completed: QuizCompletedParams;
  quiz_interrupted: QuizInterruptedParams;
  quiz_question_answered: QuizQuestionAnsweredParams;
  quiz_hint_viewed: QuizHintViewedParams;
  quiz_tts_played: QuizTtsPlayedParams;
  quiz_settings_toggled_in_quiz: QuizSettingsToggledInQuizParams;

  // Quiz Results
  quiz_results_viewed: QuizResultsViewedParams;
  quiz_results_action: QuizResultsActionParams;

  // Navigation & Modes
  practice_mode_selected: PracticeModeSelectedParams;
  category_selected: CategorySelectedParams;
  cefr_tab_switched: CefrTabSwitchedParams;

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

  // Ad Reward & Ads
  ad_reward_viewed: AdRewardViewedParams;
  ad_reward_earned: AdRewardEarnedParams;
  ad_impression: AdImpressionParams;
  ad_fallback_used: AdFallbackUsedParams;
  ad_no_fill: AdNoFillParams;

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

  // Premium Subscriptions & Paywall Funnel
  premium_sheet_shown: Record<string, never>;
  premium_purchase_success: Record<string, never>;
  premium_restore_success: Record<string, never>;
  paywall_sheet_shown: PaywallSheetShownParams;
  paywall_plan_selected: PaywallPlanSelectedParams;
  paywall_purchase_started: PaywallPurchaseStartedParams;
  paywall_purchase_success: PaywallPurchaseSuccessParams;
  paywall_purchase_failed: PaywallPurchaseFailedParams;
  paywall_purchase_cancelled: PaywallPurchaseCancelledParams;
  paywall_restore_clicked: PaywallRestoreClickedParams;
  paywall_restore_success: PaywallRestoreSuccessParams;
  paywall_restore_empty: PaywallRestoreEmptyParams;
  paywall_sheet_dismissed: PaywallSheetDismissedParams;
  locked_item_clicked: LockedItemClickedParams;
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
