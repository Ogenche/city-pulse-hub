import { type TicketmasterEvent, type Event } from '../types/events';

// Retrieve the API key from environment variables.
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;
const API_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

/**
 * Fetches events from the Ticketmaster API based on latitude and longitude.
 * @param lat The latitude for the search center.
 * @param lng The longitude for the search center.
 * @returns A promise that resolves to an array of cleaned Event objects.
 */
export const fetchEvents = async (lat: number, lng: number): Promise<Event[]> => {
  // Construct the API URL with query parameters.
  // We search for music events within a 20km radius.
  const url = new URL(API_BASE_URL);
  url.searchParams.append('apikey', API_KEY);
  url.searchParams.append('latlong', `${lat},${lng}`);
  url.searchParams.append('radius', '20');
  url.searchParams.append('unit', 'km');
  url.searchParams.append('classificationName', 'Music'); // Focus on music events for now
  url.searchParams.append('sort', 'date,asc');

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // If the API returns a non-200 status, throw an error.
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();

    // The actual events are nested in _embedded.events.
    const rawEvents: TicketmasterEvent[] = data._embedded?.events || [];

    // --- Data Transformation ---
    // This is a key step: we transform the messy API data into the clean `Event`
    // structure our app will use. We also filter out any events that are missing
    // crucial location data.
    const cleanedEvents: Event[] = rawEvents
      .map(event => {
        const venue = event._embedded?.venues?.[0];
        const location = venue?.location;

        if (!location?.latitude || !location?.longitude) {
          return null; // Skip this event if it has no location
        }

        return {
          id: event.id,
          name: event.name,
          url: event.url,
          imageUrl: event.images?.[0]?.url || '', // Use the first image
          location: {
            lat: parseFloat(location.latitude),
            lng: parseFloat(location.longitude),
          },
        };
      })
      .filter((event): event is Event => event !== null); // Filter out the nulls

    return cleanedEvents;

  } catch (error) {
    console.error("Error fetching from Ticketmaster API:", error);
    // In case of an error, return an empty array to prevent the app from crashing.
    return [];
  }
};