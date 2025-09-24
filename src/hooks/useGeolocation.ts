import { useState, useEffect } from 'react';

// Define the structure of the coordinates object for type safety
interface Coordinates {
  lat: number;
  lng: number;
}

// Define the structure of the hook's return value
interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: GeolocationPositionError | Error | null;
}

// A sensible default location (central London) if geolocation fails or is denied.
const DEFAULT_LOCATION: Coordinates = { lat: 51.5074, lng: -0.1278 };

/**
 * A custom React hook to get the user's current geolocation.
 *
 * @returns {GeolocationState} An object containing the coordinates, loading state, and any errors.
 */
export const useGeolocation = (): GeolocationState => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<GeolocationPositionError | Error | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    // Check if the Geolocation API is available in the browser
    if (!('geolocation' in navigator)) {
      setError(new Error('Geolocation is not supported by your browser.'));
      setCoordinates(DEFAULT_LOCATION); // Fallback to default
      setLoading(false);
      return;
    }

    // Success callback
    const handleSuccess = (position: GeolocationPosition) => {
      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
    };

    // Error callback
    const handleError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error.message);
      setError(error);
      setCoordinates(DEFAULT_LOCATION); // Fallback to default on error
      setLoading(false);
    };

    // Options for the geolocation request
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    // Request the user's location
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

  }, []); // Empty dependency array ensures this effect runs only once on mount

  return { coordinates, loading, error };
};