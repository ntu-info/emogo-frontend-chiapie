import * as Location from 'expo-location';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      console.log('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    console.log('Location obtained:', location.coords);
    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

export const getLocationFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<Location.LocationGeocodedAddress[] | null> => {
  try {
    const address = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    return address;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};
