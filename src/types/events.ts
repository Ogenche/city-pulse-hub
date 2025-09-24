// This file defines the shape of the data we expect from the Ticketmaster API.
// Defining types helps prevent bugs and improves code autocompletion.

// The raw, nested structure from the Ticketmaster API response.
export interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  images: { url: string }[];
  _embedded: {
    venues: {
      location?: {
        latitude: string;
        longitude: string;
      };
    }[];
  };
}

// A cleaner, simplified Event structure that we will use within our application.
export interface Event {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
}