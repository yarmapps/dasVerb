import { requireOptionalNativeModule } from 'expo';
import { useRef, useEffect } from 'react';

export interface SpeechRecognitionResultItem {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionResultEvent {
  results?: SpeechRecognitionResultItem[];
  isFinal?: boolean;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  requiresOnDeviceRecognition?: boolean;
  addsPunctuation?: boolean;
  contextualStrings?: string[];
  maxAlternatives?: number;
  androidIntentOptions?: Record<string, any>;
  iosCategory?: Record<string, any>;
}

export interface SpeechRecognitionPermissionResponse {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain?: boolean;
}

export interface NativeSpeechRecognitionModuleShape {
  requestPermissionsAsync: () => Promise<SpeechRecognitionPermissionResponse>;
  getPermissionsAsync?: () => Promise<SpeechRecognitionPermissionResponse>;
  start: (options?: SpeechRecognitionOptions) => Promise<void>;
  stop: () => Promise<void>;
  abort: () => Promise<void>;
  getStateAsync?: () => Promise<string>;
  setCategoryIOS?: (options: {
    category: string;
    categoryOptions?: string[];
    mode?: string;
  }) => void;
  addListener?: (eventName: string, listener: (...args: any[]) => void) => { remove: () => void };
  removeListener?: (eventName: string, listener: (...args: any[]) => void) => void;
}

// Safely probe for the native module without throwing if it is not compiled into the current binary
function getNativeModule(): NativeSpeechRecognitionModuleShape | null {
  try {
    const mod =
      requireOptionalNativeModule<NativeSpeechRecognitionModuleShape>('ExpoSpeechRecognition');
    return mod ?? null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[speechRecognitionService] requireOptionalNativeModule failed:', error);
    }
    return null;
  }
}

const rawNativeModule = getNativeModule();

export const isSpeechRecognitionSupported = (): boolean => {
  return rawNativeModule !== null && rawNativeModule !== undefined;
};

// Fallback module when running in Expo Go or an unlinked dev build
const fallbackModule: NativeSpeechRecognitionModuleShape = {
  requestPermissionsAsync: async (): Promise<SpeechRecognitionPermissionResponse> => ({
    status: 'denied',
    granted: false,
    canAskAgain: false,
  }),
  getPermissionsAsync: async (): Promise<SpeechRecognitionPermissionResponse> => ({
    status: 'denied',
    granted: false,
    canAskAgain: false,
  }),
  start: async (_options?: SpeechRecognitionOptions): Promise<void> => {
    if (__DEV__) {
      console.warn(
        '[speechRecognitionService] Native ExpoSpeechRecognition module not available in this build.',
      );
    }
  },
  stop: async (): Promise<void> => {},
  abort: async (): Promise<void> => {},
  getStateAsync: async (): Promise<string> => 'inactive',
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
};

export const ExpoSpeechRecognitionModule: NativeSpeechRecognitionModuleShape =
  rawNativeModule ?? fallbackModule;

/**
 * Safe hook for speech recognition events.
 * If the native module is not linked, silently ignores without throwing runtime exceptions.
 */
export function useSpeechRecognitionEvent(
  eventName: 'result' | 'error' | 'start' | 'end' | string,
  listener: (event: any) => void,
): void {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!rawNativeModule || typeof rawNativeModule.addListener !== 'function') {
      return;
    }

    const callback = (event: any) => {
      listenerRef.current(event);
    };

    try {
      const subscription = rawNativeModule.addListener(eventName, callback);
      return () => {
        try {
          subscription?.remove?.();
        } catch {
          // ignore
        }
      };
    } catch (err) {
      if (__DEV__) {
        console.warn(`[speechRecognitionService] Failed to listen to ${eventName}:`, err);
      }
    }
  }, [eventName]);
}
