import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationState {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to get user's current location
 */
export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
  });

  const requestLocation = async () => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Permission to access location was denied',
        }));
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to get location',
      }));
    }
  };

  return {
    ...state,
    requestLocation,
  };
};
