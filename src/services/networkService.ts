import { fetch as fetchNetInfo, NetInfoState } from '@react-native-community/netinfo';

/**
 * Checks if the device has an active internet connection.
 * Returns false only if disconnected or if internet is explicitly unreachable.
 */
export async function isNetworkConnected(): Promise<boolean> {
  try {
    const state: NetInfoState = await fetchNetInfo();
    if (state.isConnected === false) {
      return false;
    }
    if (state.isInternetReachable === false) {
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[networkService] NetInfo check failed, assuming online:', error);
    return true;
  }
}
